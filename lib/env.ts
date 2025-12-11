import { z } from 'zod';

// Environment variable schema with validation
const envSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),

  // Make.com Integration
  MAKE_WEBHOOK_URL: z.string().url('Invalid Make.com webhook URL'),

  // Security
  INGEST_API_SECRET: z.string().min(32, 'Ingest API secret must be at least 32 characters'),
  ADMIN_PASSWORD: z.string().min(6, 'Admin password must be at least 6 characters'),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL'),
});

// Parse environment variables - this will throw if validation fails
function getEnv() {
  // In development, we may not have all env vars set initially
  // This function is called at runtime, so we validate what we have
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    MAKE_WEBHOOK_URL: process.env.MAKE_WEBHOOK_URL,
    INGEST_API_SECRET: process.env.INGEST_API_SECRET,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
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
    return process.env.NEXT_PUBLIC_SUPABASE_URL!;
  },
  get supabaseAnonKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  },
  get supabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY!;
  },
  get makeWebhookUrl() {
    return process.env.MAKE_WEBHOOK_URL!;
  },
  get ingestApiSecret() {
    return process.env.INGEST_API_SECRET!;
  },
  get adminPassword() {
    return process.env.ADMIN_PASSWORD!;
  },
  get appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL!;
  },
};

// Validate all env vars at startup (call this in a server component or API route)
export function validateEnv() {
  return getEnv();
}

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;
