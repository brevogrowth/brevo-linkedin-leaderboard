import { Suspense } from 'react';
import { getSupabaseClient } from '@/lib/db';
import { DashboardClient } from './dashboard-client';
import type { DashboardKPIs } from '@/types/domain';
import type { LeaderboardEntry, LeaderboardEntryRequired, LinkedInPost, TeamType } from '@/types/database.types';

// Revalidate every 60 seconds
export const revalidate = 60;

interface LeaderboardUser extends LeaderboardEntryRequired {
  trend: 'up' | 'down' | 'stable';
  topPosts?: LinkedInPost[];
}

// Transform nullable leaderboard entry to required type with defaults
function toLeaderboardRequired(entry: LeaderboardEntry): LeaderboardEntryRequired {
  return {
    id: entry.id || '',
    name: entry.name || 'Unknown',
    linkedin_url: entry.linkedin_url || '',
    team: (entry.team as TeamType) || 'Sales_Pro',
    last_scraped_at: entry.last_scraped_at,
    total_posts: entry.total_posts || 0,
    total_likes: entry.total_likes || 0,
    total_comments: entry.total_comments || 0,
    total_reposts: entry.total_reposts || 0,
    total_score: entry.total_score || 0,
    rank: entry.rank || 0,
  };
}

async function getDashboardData(): Promise<{
  kpis: DashboardKPIs;
  leaderboard: LeaderboardUser[];
}> {
  const supabase = getSupabaseClient();

  // Get current month start date
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  // Fetch all data in parallel
  const [
    activeUsersResult,
    totalUsersResult,
    currentMonthPostsResult,
    lastMonthPostsResult,
    leaderboardResult,
    lastScrapedResult,
  ] = await Promise.all([
    // Active users who posted this month
    supabase
      .from('linkedin_posts')
      .select('tracked_user_id')
      .gte('published_at', monthStart),

    // Total active users
    supabase
      .from('tracked_users')
      .select('id')
      .eq('is_active', true),

    // Current month posts with engagement
    supabase
      .from('linkedin_posts')
      .select('likes_count, comments_count, reposts_count')
      .gte('published_at', monthStart),

    // Last month posts for comparison
    supabase
      .from('linkedin_posts')
      .select('id')
      .gte('published_at', lastMonthStart)
      .lt('published_at', lastMonthEnd),

    // Leaderboard view
    supabase
      .from('leaderboard_view')
      .select('*')
      .order('total_score', { ascending: false }),

    // Last scrape job
    supabase
      .from('scrape_jobs')
      .select('completed_at')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  // Calculate KPIs
  const activePosters = new Set(
    activeUsersResult.data?.map((p) => p.tracked_user_id) || []
  ).size;
  const totalUsers = totalUsersResult.data?.length || 0;

  const currentMonthPosts = currentMonthPostsResult.data?.length || 0;
  const lastMonthPosts = lastMonthPostsResult.data?.length || 0;
  const postsChangePercent =
    lastMonthPosts > 0
      ? Math.round(((currentMonthPosts - lastMonthPosts) / lastMonthPosts) * 100)
      : currentMonthPosts > 0
      ? 100
      : 0;

  const totalEngagement =
    currentMonthPostsResult.data?.reduce(
      (sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0) + (p.reposts_count || 0),
      0
    ) || 0;

  const formatEngagement = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const leaderboardData = (leaderboardResult.data as LeaderboardEntry[]) || [];
  // Transform to required types with defaults
  const leaderboardRequired = leaderboardData.map(toLeaderboardRequired);
  const topPerformer = leaderboardRequired[0] || null;

  // Fetch top 3 posts for each user
  const leaderboardWithPosts: LeaderboardUser[] = await Promise.all(
    leaderboardRequired.map(async (user) => {
      const { data: posts } = await supabase
        .from('linkedin_posts')
        .select('*')
        .eq('tracked_user_id', user.id)
        .order('score', { ascending: false })
        .limit(3);

      return {
        ...user,
        trend: 'stable' as const,
        topPosts: (posts as LinkedInPost[]) || [],
      };
    })
  );

  return {
    kpis: {
      activePosters: {
        count: activePosters,
        total: totalUsers,
        percentage: totalUsers > 0 ? Math.round((activePosters / totalUsers) * 100) : 0,
      },
      totalPosts: {
        count: currentMonthPosts,
        previousCount: lastMonthPosts,
        changePercent: postsChangePercent,
      },
      totalEngagement: {
        count: totalEngagement,
        formatted: formatEngagement(totalEngagement),
      },
      topPerformer: topPerformer
        ? {
            name: topPerformer.name,
            score: topPerformer.total_score,
          }
        : null,
      lastUpdated: lastScrapedResult.data?.completed_at || null,
    },
    leaderboard: leaderboardWithPosts,
  };
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg" />
    </div>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient initialData={data} />
    </Suspense>
  );
}
