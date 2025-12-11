-- LinkedIn Voice Program Tracker - Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: tracked_users
-- Stores all sales team members being tracked
-- ============================================
CREATE TABLE tracked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  linkedin_url VARCHAR(500) NOT NULL UNIQUE,
  team VARCHAR(50) NOT NULL CHECK (team IN ('Sales_Enterprise', 'Sales_Pro', 'BDR')),
  is_active BOOLEAN DEFAULT TRUE,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tracked_users
CREATE INDEX idx_tracked_users_active ON tracked_users(is_active);
CREATE INDEX idx_tracked_users_team ON tracked_users(team);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tracked_users_updated_at
  BEFORE UPDATE ON tracked_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: linkedin_posts
-- Stores all scraped LinkedIn posts
-- ============================================
CREATE TABLE linkedin_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracked_user_id UUID NOT NULL REFERENCES tracked_users(id) ON DELETE CASCADE,
  external_post_id VARCHAR(255) NOT NULL UNIQUE,
  post_url TEXT NOT NULL,
  content_snippet TEXT,
  post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('original', 'repost')),
  published_at TIMESTAMPTZ NOT NULL,

  -- Engagement metrics
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  reposts_count INT DEFAULT 0,

  -- Computed score (stored generated column for performance)
  -- Score = (likes * 1) + (comments * 2) + (reposts * 3) + type_bonus
  -- type_bonus: original = 2, repost = 1
  score INT GENERATED ALWAYS AS (
    (likes_count * 1) +
    (comments_count * 2) +
    (reposts_count * 3) +
    CASE WHEN post_type = 'original' THEN 2 ELSE 1 END
  ) STORED,

  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for linkedin_posts
CREATE INDEX idx_posts_user ON linkedin_posts(tracked_user_id);
CREATE INDEX idx_posts_published ON linkedin_posts(published_at DESC);
CREATE INDEX idx_posts_score ON linkedin_posts(score DESC);
CREATE UNIQUE INDEX idx_posts_external ON linkedin_posts(external_post_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_linkedin_posts_updated_at
  BEFORE UPDATE ON linkedin_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: scrape_jobs
-- Tracks the status of scraping operations
-- ============================================
CREATE TABLE scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  triggered_by VARCHAR(100),
  total_users INT,
  processed_users INT DEFAULT 0,
  new_posts INT DEFAULT 0,
  updated_posts INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for scrape_jobs
CREATE INDEX idx_scrape_jobs_status ON scrape_jobs(status);
CREATE INDEX idx_scrape_jobs_created ON scrape_jobs(created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- Enable RLS on all tables
ALTER TABLE tracked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (dashboard is public)
CREATE POLICY "Allow public read access to tracked_users"
  ON tracked_users FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to linkedin_posts"
  ON linkedin_posts FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to scrape_jobs"
  ON scrape_jobs FOR SELECT
  USING (true);

-- Create policies for service role write access
CREATE POLICY "Allow service role to insert tracked_users"
  ON tracked_users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update tracked_users"
  ON tracked_users FOR UPDATE
  USING (true);

CREATE POLICY "Allow service role to delete tracked_users"
  ON tracked_users FOR DELETE
  USING (true);

CREATE POLICY "Allow service role to insert linkedin_posts"
  ON linkedin_posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update linkedin_posts"
  ON linkedin_posts FOR UPDATE
  USING (true);

CREATE POLICY "Allow service role to delete linkedin_posts"
  ON linkedin_posts FOR DELETE
  USING (true);

CREATE POLICY "Allow service role to insert scrape_jobs"
  ON scrape_jobs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update scrape_jobs"
  ON scrape_jobs FOR UPDATE
  USING (true);

-- ============================================
-- Useful Views for Dashboard
-- ============================================

-- View: User leaderboard with aggregated stats
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  tu.id,
  tu.name,
  tu.linkedin_url,
  tu.team,
  tu.last_scraped_at,
  COUNT(lp.id) AS total_posts,
  COALESCE(SUM(lp.likes_count), 0) AS total_likes,
  COALESCE(SUM(lp.comments_count), 0) AS total_comments,
  COALESCE(SUM(lp.reposts_count), 0) AS total_reposts,
  COALESCE(SUM(lp.score), 0) AS total_score,
  RANK() OVER (ORDER BY COALESCE(SUM(lp.score), 0) DESC) AS rank
FROM tracked_users tu
LEFT JOIN linkedin_posts lp ON tu.id = lp.tracked_user_id
WHERE tu.is_active = true
GROUP BY tu.id, tu.name, tu.linkedin_url, tu.team, tu.last_scraped_at
ORDER BY total_score DESC;

-- View: Monthly leaderboard
CREATE OR REPLACE VIEW monthly_leaderboard_view AS
SELECT
  tu.id,
  tu.name,
  tu.linkedin_url,
  tu.team,
  DATE_TRUNC('month', lp.published_at) AS month,
  COUNT(lp.id) AS posts_count,
  COALESCE(SUM(lp.likes_count), 0) AS likes,
  COALESCE(SUM(lp.comments_count), 0) AS comments,
  COALESCE(SUM(lp.reposts_count), 0) AS reposts,
  COALESCE(SUM(lp.score), 0) AS score
FROM tracked_users tu
LEFT JOIN linkedin_posts lp ON tu.id = lp.tracked_user_id
WHERE tu.is_active = true
  AND lp.published_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY tu.id, tu.name, tu.linkedin_url, tu.team, DATE_TRUNC('month', lp.published_at)
ORDER BY score DESC;
