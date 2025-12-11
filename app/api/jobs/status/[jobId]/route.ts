import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db';
import type { ScrapeJob } from '@/types/database.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('scrape_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const job = data as ScrapeJob;

    // Format response based on job status
    if (job.status === 'pending' || job.status === 'processing') {
      return NextResponse.json({
        status: job.status,
        progress: {
          total: job.total_users || 0,
          processed: job.processed_users || 0,
        },
      });
    }

    if (job.status === 'completed') {
      return NextResponse.json({
        status: 'completed',
        summary: {
          newPosts: job.new_posts || 0,
          updatedPosts: job.updated_posts || 0,
          completedAt: job.completed_at,
        },
      });
    }

    if (job.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        error: job.error_message || 'Unknown error',
      });
    }

    return NextResponse.json({ status: job.status });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
