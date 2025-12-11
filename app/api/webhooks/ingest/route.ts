import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/db';
import {
  ingestPayloadSchema,
  extractContentSnippet,
  validateIngestSecret,
} from '@/lib/validation/ingest-schema';

export async function POST(request: NextRequest) {
  try {
    // 1. Validate API secret
    const apiSecret = request.headers.get('x-api-secret');

    if (!validateIngestSecret(apiSecret)) {
      console.warn('Invalid API secret attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const parseResult = ingestPayloadSchema.safeParse(body);

    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.flatten());
      return NextResponse.json(
        {
          error: 'Invalid payload',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { jobId, results } = parseResult.data;
    const supabase = getSupabaseAdmin();

    // 3. Verify job exists and is processing
    const { data: job, error: jobError } = await supabase
      .from('scrape_jobs')
      .select('id, status')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'processing' && job.status !== 'pending') {
      return NextResponse.json(
        { error: 'Job is not in a valid state for ingestion' },
        { status: 400 }
      );
    }

    // 4. Process each user's results
    let newPostsCount = 0;
    let updatedPostsCount = 0;
    let processedUsersCount = 0;

    for (const userResult of results) {
      try {
        // Process each post for this user
        for (const post of userResult.posts) {
          // Prepare post data for upsert
          const postData = {
            tracked_user_id: userResult.userId,
            external_post_id: post.postId,
            post_url: post.postUrl,
            content_snippet: extractContentSnippet(post.text),
            post_type: post.type as 'original' | 'repost',
            published_at: post.publishedDate,
            likes_count: post.likes,
            comments_count: post.comments,
            reposts_count: post.reposts,
            scraped_at: new Date().toISOString(),
          };

          // Upsert post (insert or update if exists)
          const { data: existingPost } = await supabase
            .from('linkedin_posts')
            .select('id')
            .eq('external_post_id', post.postId)
            .single();

          if (existingPost) {
            // Update existing post
            await supabase
              .from('linkedin_posts')
              .update({
                likes_count: postData.likes_count,
                comments_count: postData.comments_count,
                reposts_count: postData.reposts_count,
                scraped_at: postData.scraped_at,
              })
              .eq('external_post_id', post.postId);

            updatedPostsCount++;
          } else {
            // Insert new post
            const { error: insertError } = await supabase
              .from('linkedin_posts')
              .insert(postData);

            if (insertError) {
              console.error('Error inserting post:', insertError);
            } else {
              newPostsCount++;
            }
          }
        }

        // Update user's last_scraped_at
        await supabase
          .from('tracked_users')
          .update({ last_scraped_at: new Date().toISOString() })
          .eq('id', userResult.userId);

        processedUsersCount++;

        // Update job progress
        await supabase
          .from('scrape_jobs')
          .update({ processed_users: processedUsersCount })
          .eq('id', jobId);

      } catch (userError) {
        console.error(`Error processing user ${userResult.userId}:`, userError);
      }
    }

    // 5. Mark job as completed
    await supabase
      .from('scrape_jobs')
      .update({
        status: 'completed',
        processed_users: processedUsersCount,
        new_posts: newPostsCount,
        updated_posts: updatedPostsCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return NextResponse.json({
      success: true,
      summary: {
        processedUsers: processedUsersCount,
        newPosts: newPostsCount,
        updatedPosts: updatedPostsCount,
      },
    });
  } catch (error) {
    console.error('Error in ingest webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
