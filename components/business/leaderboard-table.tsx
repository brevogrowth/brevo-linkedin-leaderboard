'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import {
  ChevronDown,
  ChevronUp,
  Search,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  ExternalLink,
  X,
  HelpCircle,
  Linkedin,
} from 'lucide-react';
import { getRankStyle, getRankEmoji, formatEngagement, SCORING_CONFIG } from '@/lib/scoring';
import { TEAM_DISPLAY_NAMES } from '@/lib/validation/user-schema';
import { BRANDING } from '@/config/branding';
import type { LeaderboardEntryRequired, LinkedInPost } from '@/types/database.types';

interface LeaderboardUser extends LeaderboardEntryRequired {
  topPosts?: LinkedInPost[];
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  isLoading?: boolean;
}

const TEAM_OPTIONS = [
  { value: '', label: 'All Teams' },
  { value: 'Sales_Enterprise', label: 'Sales Enterprise' },
  { value: 'Sales_Pro', label: 'Sales Pro' },
  { value: 'BDR', label: 'BDR' },
];

// Get team color from branding config
function getTeamColor(teamId: string): string {
  const team = BRANDING.teams.find((t) => t.id === teamId);
  return team?.color || '#6B7280';
}

// Score formula explanation
const SCORE_TOOLTIP = `Score = Likes × ${SCORING_CONFIG.LIKE_POINTS} + Comments × ${SCORING_CONFIG.COMMENT_POINTS} + Reposts × ${SCORING_CONFIG.REPOST_POINTS} + Type Bonus (Original: +${SCORING_CONFIG.ORIGINAL_POST_BONUS}, Repost: +${SCORING_CONFIG.REPOST_BONUS})`;

export function LeaderboardTable({ users, isLoading }: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTeam = !teamFilter || user.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const hasActiveFilters = searchQuery !== '' || teamFilter !== '';

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setTeamFilter('');
  }, []);

  const toggleRow = useCallback((userId: string) => {
    setExpandedRow((prev) => (prev === userId ? null : userId));
  }, []);

  // Keyboard handler for row expansion
  const handleRowKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTableRowElement>, userId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleRow(userId);
      }
    },
    [toggleRow]
  );

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search users by name"
          />
        </div>
        <Select
          options={TEAM_OPTIONS}
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="w-full sm:w-48"
          aria-label="Filter by team"
        />
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            leftIcon={<X className="h-4 w-4" />}
            className="whitespace-nowrap"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table with horizontal scroll on mobile */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-gray-50">
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Team</TableHead>
              <TableHead className="text-center">Posts</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Engagement</TableHead>
              <TableHead className="text-right">
                <span className="inline-flex items-center gap-1">
                  Score
                  <Tooltip content={SCORE_TOOLTIP}>
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                  </Tooltip>
                </span>
              </TableHead>
              <TableHead className="w-10" aria-label="Expand row" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {hasActiveFilters ? (
                    <div className="space-y-2">
                      <p>No users match your filters</p>
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    'No users found'
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isExpanded = expandedRow === user.id;
                const teamColor = getTeamColor(user.team);

                return (
                  <TableRow
                    key={user.id}
                    className={`cursor-pointer ${getRankStyle(user.rank)} focus-within:ring-2 focus-within:ring-primary focus-within:ring-inset`}
                    onClick={() => toggleRow(user.id)}
                    onKeyDown={(e) => handleRowKeyDown(e, user.id)}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    aria-controls={isExpanded ? `posts-${user.id}` : undefined}
                  >
                    <TableCell className="font-medium">
                      <span className="text-lg">{getRankEmoji(user.rank)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 md:hidden">
                            {TEAM_DISPLAY_NAMES[user.team]}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: teamColor,
                          color: teamColor,
                          backgroundColor: `${teamColor}10`,
                        }}
                      >
                        {TEAM_DISPLAY_NAMES[user.team]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {user.total_posts}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-3 text-gray-500">
                        <span className="flex items-center gap-1" title="Likes">
                          <ThumbsUp className="h-3 w-3" />
                          {formatEngagement(user.total_likes)}
                        </span>
                        <span className="flex items-center gap-1" title="Comments">
                          <MessageCircle className="h-3 w-3" />
                          {formatEngagement(user.total_comments)}
                        </span>
                        <span className="flex items-center gap-1" title="Reposts">
                          <Repeat2 className="h-3 w-3" />
                          {formatEngagement(user.total_reposts)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-lg font-bold text-primary">
                        {user.total_score}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Expanded rows - rendered separately for proper layout */}
        {filteredUsers.map((user) => {
          const isExpanded = expandedRow === user.id;
          if (!isExpanded) return null;

          return (
            <div
              key={`expanded-${user.id}`}
              id={`posts-${user.id}`}
              className="bg-gray-50 border-t border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">
                  Top 3 Posts
                </p>
                {user.linkedin_url && (
                  <a
                    href={user.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-[#0A66C2] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Linkedin className="h-4 w-4" />
                    View Profile
                  </a>
                )}
              </div>
              {user.topPosts && user.topPosts.length > 0 ? (
                <div className="space-y-3">
                  {user.topPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.content_snippet || 'No content'}
                      </p>
                      <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {post.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.comments_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Repeat2 className="h-3 w-3" />
                            {post.reposts_count}
                          </span>
                          <Badge variant="info" size="sm">
                            Score: {post.score}
                          </Badge>
                        </div>
                        <a
                          href={post.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on LinkedIn
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No posts found</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
