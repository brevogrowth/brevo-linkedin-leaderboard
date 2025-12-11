'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ScrapeProgress, JobStatusResponse } from '@/types/domain';

interface UseScrapePollingOptions {
  pollInterval?: number;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function useScrapePolling(options: UseScrapePollingOptions = {}) {
  const { pollInterval = 3000, onComplete, onError } = options;

  const [isPolling, setIsPolling] = useState(false);
  const [progress, setProgress] = useState<ScrapeProgress | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for job status
  const pollJobStatus = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/jobs/status/${id}`);
        const data: JobStatusResponse = await response.json();

        setProgress({
          status: data.status,
          progress: data.progress,
          summary: data.summary,
          error: data.error,
        });

        // Stop polling if job is complete or failed
        if (data.status === 'completed' || data.status === 'failed') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsPolling(false);

          if (data.status === 'completed') {
            onComplete?.();
          } else if (data.status === 'failed') {
            onError?.(data.error || 'Job failed');
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        // Don't stop polling on network errors, retry
      }
    },
    [onComplete, onError]
  );

  // Start a new scrape job
  const triggerScrape = useCallback(async () => {
    try {
      setIsPolling(true);
      setProgress({ status: 'pending' });

      const response = await fetch('/api/jobs/trigger', {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to trigger scrape');
      }

      setJobId(data.jobId);
      setProgress({ status: 'processing' });

      // Start polling
      intervalRef.current = setInterval(() => {
        pollJobStatus(data.jobId);
      }, pollInterval);

      // Initial poll
      pollJobStatus(data.jobId);
    } catch (error) {
      setIsPolling(false);
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      setProgress({ status: 'failed', error: errorMessage });
      onError?.(errorMessage);
    }
  }, [pollInterval, pollJobStatus, onError]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Reset state
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
    setProgress(null);
    setJobId(null);
  }, []);

  return {
    triggerScrape,
    isPolling,
    progress,
    jobId,
    reset,
  };
}
