// Score calculation utilities for LinkedIn posts
// Score = (likes * 1) + (comments * 2) + (reposts * 3) + type_bonus
// type_bonus: original = 2, repost = 1

export const SCORING_CONFIG = {
  LIKE_POINTS: 1,
  COMMENT_POINTS: 2,
  REPOST_POINTS: 3,
  ORIGINAL_POST_BONUS: 2,
  REPOST_BONUS: 1,
} as const;

export type PostType = 'original' | 'repost';

export interface EngagementMetrics {
  likes: number;
  comments: number;
  reposts: number;
}

export function calculatePostScore(
  metrics: EngagementMetrics,
  postType: PostType
): number {
  const engagementScore =
    metrics.likes * SCORING_CONFIG.LIKE_POINTS +
    metrics.comments * SCORING_CONFIG.COMMENT_POINTS +
    metrics.reposts * SCORING_CONFIG.REPOST_POINTS;

  const typeBonus =
    postType === 'original'
      ? SCORING_CONFIG.ORIGINAL_POST_BONUS
      : SCORING_CONFIG.REPOST_BONUS;

  return engagementScore + typeBonus;
}

export function formatEngagement(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export function getScoreColor(score: number): string {
  if (score >= 51) return 'text-green-600 bg-green-50';
  if (score >= 11) return 'text-blue-600 bg-blue-50';
  return 'text-gray-600 bg-gray-50';
}

export function getRankStyle(rank: number): string {
  if (rank === 1) return 'rank-gold';
  if (rank === 2) return 'rank-silver';
  if (rank === 3) return 'rank-bronze';
  return '';
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export function calculateChangePercent(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}
