'use client';

import { useState } from 'react';
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
import {
  ChevronDown,
  ChevronUp,
  Search,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  ExternalLink,
} from 'lucide-react';
import { getRankStyle, getRankEmoji, formatEngagement } from '@/lib/scoring';
import { TEAM_DISPLAY_NAMES } from '@/lib/validation/user-schema';
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

  const toggleRow = (userId: string) => {
    setExpandedRow(expandedRow === userId ? null : userId);
  };

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
          />
        </div>
        <Select
          options={TEAM_OPTIONS}
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="w-full sm:w-48"
        />
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-gray-50">
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Team</TableHead>
              <TableHead className="text-center">Posts</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Engagement</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <>
                  <TableRow
                    key={user.id}
                    className={`cursor-pointer ${getRankStyle(user.rank)}`}
                    onClick={() => toggleRow(user.id)}
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
                      <Badge variant="outline">
                        {TEAM_DISPLAY_NAMES[user.team]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {user.total_posts}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-3 text-gray-500">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {formatEngagement(user.total_likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {formatEngagement(user.total_comments)}
                        </span>
                        <span className="flex items-center gap-1">
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
                      {expandedRow === user.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </TableCell>
                  </TableRow>
                  {/* Expanded row - Top Posts */}
                  {expandedRow === user.id && user.topPosts && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-gray-50 p-4">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700">
                            Top 3 Posts
                          </p>
                          {user.topPosts.length > 0 ? (
                            user.topPosts.map((post) => (
                              <div
                                key={post.id}
                                className="bg-white p-3 rounded-lg border border-gray-200"
                              >
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {post.content_snippet || 'No content'}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
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
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">
                              No posts found
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
