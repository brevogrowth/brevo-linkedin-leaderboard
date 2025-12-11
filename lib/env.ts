import { z } from 'zod';

// Environment variable schema with validation
const envSchema = z.object({
  // Supabase Configuration
  SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required').optional(),

  // Make.com Integration
  MAKE_WEBHOOK_URL: z.string().url('Invalid Make.com webhook URL'),

  // Security
  ADMIN_PASSWORD: z.string().min(6, 'Admin password must be at least 6 characters'),
});

// Parse environment variables - this will throw if validation fails
function getEnv() {
  // In development, we may not have all env vars set initially
  // This function is called at runtime, so we validate what we have
  const parsed = envSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    MAKE_WEBHOOK_URL: process.env.MAKE_WEBHOOK_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  });

  if (!parsed.success) {
    console.error('Environment validation failed:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration. Check your .env.local file.');
  }

  return parsed.data;
}

// Export validated environment variables
// Note: Only call this after env vars are loaded
export const env = {
  get supabaseUrl() {
    return process.env.SUPABASE_URL!;
  },
  get supabaseAnonKey() {
    return process.env.SUPABASE_ANON_KEY!;
  },
  get supabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY!;
  },
  get makeWebhookUrl() {
    return process.env.MAKE_WEBHOOK_URL!;
  },
  get adminPassword() {
    return process.env.ADMIN_PASSWORD!;
  },
};

// Validate all env vars at startup (call this in a server component or API route)
export function validateEnv() {
  return getEnv();
}

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;
