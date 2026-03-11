import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plfjxxakrqxveufldtrc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZmp4eGFrcnF4dmV1ZmxkdHJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzMjE1NSwiZXhwIjoyMDg2NTA4MTU1fQ.ZBqdbXCpeGDyA8WdhxhWUOUyScahVV21jE8wnx2pvCM';

// Singleton pattern to avoid multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Lazy singleton - only creates client when first accessed
export function getSupabase(): ReturnType<typeof createClient> {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

// Backward-compatible export - use getter to ensure singleton
export const supabase = getSupabase();
