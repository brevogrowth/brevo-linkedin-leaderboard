// Generated types for Supabase database schema
// This file should be regenerated using: supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TeamType = 'Sales_Enterprise' | 'Sales_Pro' | 'BDR';
export type PostType = 'original' | 'repost';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Database {
  public: {
    Tables: {
      tracked_users: {
        Row: {
          id: string;
          name: string;
          linkedin_url: string;
          team: TeamType;
          is_active: boolean;
          last_scraped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          linkedin_url: string;
          team: TeamType;
          is_active?: boolean;
          last_scraped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          linkedin_url?: string;
          team?: TeamType;
          is_active?: boolean;
          last_scraped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      linkedin_posts: {
        Row: {
          id: string;
          tracked_user_id: string;
          external_post_id: string;
          post_url: string;
          content_snippet: string | null;
          post_type: PostType;
          published_at: string;
          likes_count: number;
          comments_count: number;
          reposts_count: number;
          score: number;
          scraped_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tracked_user_id: string;
          external_post_id: string;
          post_url: string;
          content_snippet?: string | null;
          post_type: PostType;
          published_at: string;
          likes_count?: number;
          comments_count?: number;
          reposts_count?: number;
          scraped_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tracked_user_id?: string;
          external_post_id?: string;
          post_url?: string;
          content_snippet?: string | null;
          post_type?: PostType;
          published_at?: string;
          likes_count?: number;
          comments_count?: number;
          reposts_count?: number;
          scraped_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'linkedin_posts_tracked_user_id_fkey';
            columns: ['tracked_user_id'];
            isOneToOne: false;
            referencedRelation: 'tracked_users';
            referencedColumns: ['id'];
          }
        ];
      };
      scrape_jobs: {
        Row: {
          id: string;
          status: JobStatus;
          triggered_by: string | null;
          total_users: number | null;
          processed_users: number;
          new_posts: number;
          updated_posts: number;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          status?: JobStatus;
          triggered_by?: string | null;
          total_users?: number | null;
          processed_users?: number;
          new_posts?: number;
          updated_posts?: number;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          status?: JobStatus;
          triggered_by?: string | null;
          total_users?: number | null;
          processed_users?: number;
          new_posts?: number;
          updated_posts?: number;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      leaderboard_view: {
        Row: {
          id: string | null;
          name: string | null;
          linkedin_url: string | null;
          team: TeamType | null;
          last_scraped_at: string | null;
          total_posts: number | null;
          total_likes: number | null;
          total_comments: number | null;
          total_reposts: number | null;
          total_score: number | null;
          rank: number | null;
        };
        Relationships: [];
      };
      monthly_leaderboard_view: {
        Row: {
          id: string | null;
          name: string | null;
          linkedin_url: string | null;
          team: TeamType | null;
          month: string | null;
          posts_count: number | null;
          likes: number | null;
          comments: number | null;
          reposts: number | null;
          score: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      team_type: TeamType;
      post_type: PostType;
      job_status: JobStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Convenience type aliases
export type TrackedUser = Database['public']['Tables']['tracked_users']['Row'];
export type TrackedUserInsert = Database['public']['Tables']['tracked_users']['Insert'];
export type TrackedUserUpdate = Database['public']['Tables']['tracked_users']['Update'];

export type LinkedInPost = Database['public']['Tables']['linkedin_posts']['Row'];
export type LinkedInPostInsert = Database['public']['Tables']['linkedin_posts']['Insert'];
export type LinkedInPostUpdate = Database['public']['Tables']['linkedin_posts']['Update'];

export type ScrapeJob = Database['public']['Tables']['scrape_jobs']['Row'];
export type ScrapeJobInsert = Database['public']['Tables']['scrape_jobs']['Insert'];
export type ScrapeJobUpdate = Database['public']['Tables']['scrape_jobs']['Update'];

export type LeaderboardEntry = Database['public']['Views']['leaderboard_view']['Row'];
export type MonthlyLeaderboardEntry = Database['public']['Views']['monthly_leaderboard_view']['Row'];

// Non-nullable versions for use in UI components after data validation
export interface LeaderboardEntryRequired {
  id: string;
  name: string;
  linkedin_url: string;
  team: TeamType;
  last_scraped_at: string | null;
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_reposts: number;
  total_score: number;
  rank: number;
}
