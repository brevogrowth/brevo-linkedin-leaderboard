import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Fetch all active tracked users
    const { data: users, error: usersError } = await supabase
      .from('tracked_users')
      .select('id, linkedin_url')
      .eq('is_active', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active users to scrape' },
        { status: 400 }
      );
    }

    // 2. Create a new scrape job
    const { data: job, error: jobError } = await supabase
      .from('scrape_jobs')
      .insert({
        status: 'pending',
        total_users: users.length,
        triggered_by: 'dashboard',
      })
      .select('id')
      .single();

    if (jobError || !job) {
      console.error('Error creating job:', jobError);
      return NextResponse.json(
        { success: false, error: 'Failed to create scrape job' },
        { status: 500 }
      );
    }

    // 3. Prepare payload for Make.com
    const payload = {
      jobId: job.id,
      users: users.map((u) => ({
        id: u.id,
        linkedinUrl: u.linkedin_url,
      })),
    };

    // 4. Call Make.com webhook
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!makeWebhookUrl) {
      // Update job status to failed
      await supabase
        .from('scrape_jobs')
        .update({ status: 'failed', error_message: 'Make webhook URL not configured' })
        .eq('id', job.id);

      return NextResponse.json(
        { success: false, error: 'Make webhook URL not configured' },
        { status: 500 }
      );
    }

    try {
      const makeResponse = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!makeResponse.ok) {
        throw new Error(`Make.com returned ${makeResponse.status}`);
      }

      // 5. Update job status to processing
      await supabase
        .from('scrape_jobs')
        .update({ status: 'processing' })
        .eq('id', job.id);

      return NextResponse.json({
        success: true,
        jobId: job.id,
      });
    } catch (makeError) {
      console.error('Error calling Make webhook:', makeError);

      // Update job status to failed
      await supabase
        .from('scrape_jobs')
        .update({
          status: 'failed',
          error_message: makeError instanceof Error ? makeError.message : 'Failed to trigger Make workflow',
        })
        .eq('id', job.id);

      return NextResponse.json(
        { success: false, error: 'Failed to trigger scrape workflow' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in trigger job:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
