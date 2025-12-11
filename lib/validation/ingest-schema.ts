import { z } from 'zod';

// Schema for a single LinkedIn post from PhantomBuster via Make
const postSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  postUrl: z.string().url('Post URL must be valid'),
  text: z.string().nullable().optional(),
  type: z.enum(['POST', 'REPOST']).transform((type) => {
    // Map PhantomBuster types to our database types
    return type === 'POST' ? 'original' : 'repost';
  }),
  publishedDate: z.string().datetime({ message: 'Published date must be ISO 8601 format' }),
  likes: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0),
  reposts: z.number().int().min(0).default(0),
});

export type PostInput = z.input<typeof postSchema>;
export type PostData = z.output<typeof postSchema>;

// Schema for a single user's scrape result
const userResultSchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID'),
  linkedinUrl: z.string().url('LinkedIn URL must be valid'),
  posts: z.array(postSchema).default([]),
});

export type UserResultInput = z.input<typeof userResultSchema>;
export type UserResultData = z.output<typeof userResultSchema>;

// Main ingest payload schema from Make.com
export const ingestPayloadSchema = z.object({
  jobId: z.string().uuid('Job ID must be a valid UUID'),
  results: z.array(userResultSchema).min(1, 'At least one result is required'),
});

export type IngestPayloadInput = z.input<typeof ingestPayloadSchema>;
export type IngestPayloadData = z.output<typeof ingestPayloadSchema>;

// Helper to extract snippet from post text
export function extractContentSnippet(text: string | null | undefined, maxLength = 200): string | null {
  if (!text) return null;
  const cleaned = text.trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength - 3) + '...';
}

// Validate the ingest API secret header
export function validateIngestSecret(header: string | null): boolean {
  const secret = process.env.INGEST_API_SECRET;
  if (!secret || !header) return false;
  return header === secret;
}
