import { z } from 'zod';

// LinkedIn URL validation regex
// Matches: https://linkedin.com/in/username or https://www.linkedin.com/in/username
const linkedInUrlRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

// Team type enum
export const TeamEnum = z.enum(['Sales_Enterprise', 'Sales_Pro', 'BDR']);
export type TeamType = z.infer<typeof TeamEnum>;

// Schema for creating a new tracked user
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  linkedin_url: z
    .string()
    .url('Must be a valid URL')
    .regex(linkedInUrlRegex, 'Must be a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)')
    .transform((url) => {
      // Normalize URL: ensure it ends without trailing slash and uses https
      let normalized = url.replace(/\/$/, '');
      if (normalized.startsWith('http://')) {
        normalized = normalized.replace('http://', 'https://');
      }
      return normalized;
    }),
  team: TeamEnum,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Schema for updating a tracked user
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters')
    .trim()
    .optional(),
  linkedin_url: z
    .string()
    .url('Must be a valid URL')
    .regex(linkedInUrlRegex, 'Must be a valid LinkedIn profile URL')
    .transform((url) => url.replace(/\/$/, ''))
    .optional(),
  team: TeamEnum.optional(),
  is_active: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Schema for password validation
export const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type PasswordInput = z.infer<typeof passwordSchema>;

// Team display names
export const TEAM_DISPLAY_NAMES: Record<TeamType, string> = {
  Sales_Enterprise: 'Sales Enterprise',
  Sales_Pro: 'Sales Pro',
  BDR: 'BDR',
};

// Team options for dropdowns
export const TEAM_OPTIONS = [
  { value: 'Sales_Enterprise', label: 'Sales Enterprise' },
  { value: 'Sales_Pro', label: 'Sales Pro' },
  { value: 'BDR', label: 'BDR' },
] as const;
