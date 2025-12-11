'use client';

import { useEffect } from 'react';
import { Dialog, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { ScrapeProgress } from '@/types/domain';

interface ScrapeProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: ScrapeProgress | null;
  onRetry?: () => void;
}

export function ScrapeProgressModal({
  isOpen,
  onClose,
  progress,
  onRetry,
}: ScrapeProgressModalProps) {
  // Auto-close on completion after 3 seconds
  useEffect(() => {
    if (progress?.status === 'completed') {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [progress?.status, onClose]);

  const getProgressPercentage = () => {
    if (!progress?.progress) return 0;
    const { total, processed } = progress.progress;
    if (total === 0) return 0;
    return Math.round((processed / total) * 100);
  };

  const renderContent = () => {
    if (!progress) {
      return (
        <div className="flex flex-col items-center py-8">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 text-gray-600">Initializing scrape...</p>
        </div>
      );
    }

    switch (progress.status) {
      case 'pending':
        return (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-gray-600">Starting scrape workflow...</p>
            <p className="mt-2 text-sm text-gray-400">
              Connecting to Make.com...
            </p>
          </div>
        );

      case 'processing':
        return (
          <div className="flex flex-col items-center py-8">
            <div className="relative">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
                {getProgressPercentage()}%
              </span>
            </div>
            <p className="mt-4 text-gray-600">Scraping LinkedIn profiles...</p>
            {progress.progress && (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  {progress.progress.processed} of {progress.progress.total} users processed
                </p>
                <div className="w-full mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </>
            )}
            <p className="mt-4 text-xs text-gray-400">
              This may take a few minutes...
            </p>
          </div>
        );

      case 'completed':
        return (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              Scrape Completed!
            </p>
            {progress.summary && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {progress.summary.newPosts}
                  </p>
                  <p className="text-xs text-green-600">New Posts</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {progress.summary.updatedPosts}
                  </p>
                  <p className="text-xs text-blue-600">Updated Posts</p>
                </div>
              </div>
            )}
            <p className="mt-4 text-xs text-gray-400">
              Closing automatically...
            </p>
          </div>
        );

      case 'failed':
        return (
          <div className="flex flex-col items-center py-8">
            <XCircle className="h-12 w-12 text-error" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              Scrape Failed
            </p>
            <p className="mt-2 text-sm text-gray-500 text-center">
              {progress.error || 'An unexpected error occurred'}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onRetry}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Try Again
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={progress?.status === 'processing' ? () => {} : onClose}
      title="Data Refresh"
      size="sm"
    >
      {renderContent()}
      {progress?.status !== 'processing' && progress?.status !== 'completed' && (
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      )}
    </Dialog>
  );
}
