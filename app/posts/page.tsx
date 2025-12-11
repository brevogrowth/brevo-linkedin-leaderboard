import { Suspense } from 'react';
import { getSupabaseClient } from '@/lib/db';
import { PostsClient } from './posts-client';
import type { TrackedUser } from '@/types/database.types';

export const revalidate = 60;

interface PostWithUser {
  id: string;
  tracked_user_id: string;
  external_post_id: string;
  post_url: string;
  content_snippet: string | null;
  post_type: 'original' | 'repost';
  published_at: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  score: number;
  user: {
    id: string;
    name: string;
    team: string;
  };
}

async function getPostsData(searchParams: { page?: string; user?: string; sort?: string }) {
  const supabase = getSupabaseClient();

  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;
  const userId = searchParams.user || '';
  const sortBy = searchParams.sort || 'date';

  // Get all users for the filter dropdown
  const { data: users } = await supabase
    .from('tracked_users')
    .select('id, name, team')
    .eq('is_active', true)
    .order('name');

  // Build the posts query
  let query = supabase
    .from('linkedin_posts')
    .select(`
      id,
      tracked_user_id,
      external_post_id,
      post_url,
      content_snippet,
      post_type,
      published_at,
      likes_count,
      comments_count,
      reposts_count,
      score,
      tracked_users!inner (
        id,
        name,
        team
      )
    `, { count: 'exact' });

  // Apply user filter
  if (userId) {
    query = query.eq('tracked_user_id', userId);
  }

  // Apply sorting
  if (sortBy === 'score') {
    query = query.order('score', { ascending: false });
  } else {
    query = query.order('published_at', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: posts, count, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return {
      posts: [],
      users: (users as TrackedUser[]) || [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  // Transform posts to include user info at top level
  const transformedPosts: PostWithUser[] = (posts || []).map((post) => {
    const userData = post.tracked_users as unknown as { id: string; name: string; team: string };
    return {
      id: post.id,
      tracked_user_id: post.tracked_user_id,
      external_post_id: post.external_post_id,
      post_url: post.post_url,
      content_snippet: post.content_snippet,
      post_type: post.post_type as 'original' | 'repost',
      published_at: post.published_at,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      reposts_count: post.reposts_count,
      score: post.score,
      user: userData,
    };
  });

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    posts: transformedPosts,
    users: (users as TrackedUser[]) || [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

function PostsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded w-full max-w-md" />
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; user?: string; sort?: string }>;
}) {
  const resolvedParams = await searchParams;
  const data = await getPostsData(resolvedParams);

  return (
    <Suspense fallback={<PostsSkeleton />}>
      <PostsClient
        initialPosts={data.posts}
        users={data.users}
        pagination={data.pagination}
        filters={{
          userId: resolvedParams.user || '',
          sortBy: (resolvedParams.sort as 'date' | 'score') || 'date',
        }}
      />
    </Suspense>
  );
}
