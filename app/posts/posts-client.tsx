'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ThumbsUp,
  MessageCircle,
  Repeat2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { AppHeader } from '@/components/layout/app-header';
import { formatDate } from '@/config/branding';
import { getScoreColor } from '@/lib/scoring';
import { TEAM_DISPLAY_NAMES } from '@/lib/validation/user-schema';
import type { TrackedUser, TeamType } from '@/types/database.types';

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PostsClientProps {
  initialPosts: PostWithUser[];
  users: TrackedUser[];
  pagination: Pagination;
  filters: {
    userId: string;
    sortBy: 'date' | 'score';
  };
}

export function PostsClient({
  initialPosts,
  users,
  pagination,
  filters,
}: PostsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when changing filters
      if (key !== 'page') {
        params.delete('page');
      }
      router.push(`/posts?${params.toString()}`);
    },
    [router, searchParams]
  );

  const userOptions = [
    { value: '', label: 'All Users' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const sortOptions = [
    { value: 'date', label: 'Most Recent' },
    { value: 'score', label: 'Highest Score' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader currentPage="posts" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Posts Explorer</h2>
          <p className="text-sm text-gray-500">{pagination.total} posts found</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select
            options={userOptions}
            value={filters.userId}
            onChange={(e) => updateFilters('user', e.target.value)}
            className="w-full sm:w-64"
          />
          <Select
            options={sortOptions}
            value={filters.sortBy}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="w-full sm:w-48"
          />
        </div>

        {/* Posts List */}
        {initialPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No posts found
              </h3>
              <p className="text-gray-500 mb-4">
                {filters.userId
                  ? 'This user has not posted yet. Try selecting a different user.'
                  : 'Add some users and run a scrape to see posts here.'}
              </p>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {initialPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar name={post.user.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {post.user.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="outline" size="sm">
                          {TEAM_DISPLAY_NAMES[post.user.team as TeamType]}
                        </Badge>
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                    </div>
                    <Badge
                      variant={post.post_type === 'original' ? 'info' : 'default'}
                      size="sm"
                    >
                      {post.post_type === 'original' ? 'Original' : 'Repost'}
                    </Badge>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content_snippet || 'No content preview available'}
                  </p>

                  {/* Engagement & Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="h-4 w-4" />
                        {post.reposts_count}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(
                          post.score
                        )}`}
                      >
                        Score: {post.score}
                      </span>
                      <a
                        href={post.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateFilters('page', (pagination.page - 1).toString())
                }
                disabled={!pagination.hasPrev}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateFilters('page', (pagination.page + 1).toString())
                }
                disabled={!pagination.hasNext}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
