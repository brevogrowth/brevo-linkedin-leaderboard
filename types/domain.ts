// Application-specific domain types

import type { LeaderboardEntry, LinkedInPost, TrackedUser } from './database.types';

// Dashboard KPI types
export interface DashboardKPIs {
  activePosters: {
    count: number;
    total: number;
    percentage: number;
  };
  totalPosts: {
    count: number;
    previousCount: number;
    changePercent: number;
  };
  totalEngagement: {
    count: number;
    formatted: string;
  };
  topPerformer: {
    name: string;
    score: number;
    avatar?: string;
  } | null;
  lastUpdated: string | null;
}

// Leaderboard with extra computed fields
export interface LeaderboardUser extends LeaderboardEntry {
  trend: 'up' | 'down' | 'stable';
  avatar?: string;
  topPosts?: LinkedInPostWithUser[];
}

// Post with user information
export interface LinkedInPostWithUser extends LinkedInPost {
  user: {
    id: string;
    name: string;
    team: string;
    avatar?: string;
  };
}

// Scrape job progress
export interface ScrapeProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: {
    total: number;
    processed: number;
  };
  summary?: {
    newPosts: number;
    updatedPosts: number;
    completedAt: string;
  };
  error?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TriggerJobResponse {
  success: boolean;
  jobId: string;
}

export interface JobStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: {
    total: number;
    processed: number;
  };
  summary?: {
    newPosts: number;
    updatedPosts: number;
    completedAt: string;
  };
  error?: string;
}

// Admin types
export interface UserFormData {
  name: string;
  linkedin_url: string;
  team: 'Sales_Enterprise' | 'Sales_Pro' | 'BDR';
}

// Filters
export interface PostFilters {
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy: 'date' | 'score';
  sortOrder: 'asc' | 'desc';
}

export interface LeaderboardFilters {
  team?: string;
  search?: string;
  period?: 'all' | 'month' | 'week';
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
