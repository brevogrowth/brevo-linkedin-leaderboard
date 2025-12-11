import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Create typed Supabase client
function createSupabaseClient(isAdmin = false) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = isAdmin
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Missing Supabase environment variables: ${
        !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : ''
      } ${!supabaseKey ? (isAdmin ? 'SUPABASE_SERVICE_ROLE_KEY' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY') : ''}`
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Singleton instances
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;
let adminInstance: ReturnType<typeof createSupabaseClient> | null = null;

// Public client (uses anon key) - for read operations
export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createSupabaseClient(false);
  }
  return clientInstance;
}

// Admin client (uses service role key) - for write operations
export function getSupabaseAdmin() {
  if (!adminInstance) {
    adminInstance = createSupabaseClient(true);
  }
  return adminInstance;
}

// Convenience exports
export const supabase = {
  get client() {
    return getSupabaseClient();
  },
  get admin() {
    return getSupabaseAdmin();
  },
};

export default supabase;
