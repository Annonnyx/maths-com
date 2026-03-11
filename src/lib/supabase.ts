import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plfjxxakrqxveufldtrc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZmp4eGFrcnF4dmV1ZmxkdHJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzMjE1NSwiZXhwIjoyMDg2NTA4MTU1fQ.ZBqdbXCpeGDyA8WdhxhWUOUyScahVV21jE8wnx2pvCM';

function createSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Global singleton instance to prevent multiple clients
declare global {
  var _supabaseInstance: SupabaseClient | null;
}

// Use global variable to truly ensure singleton across hot reloads
function getSupabaseInstance(): SupabaseClient {
  if (typeof globalThis._supabaseInstance === 'undefined') {
    globalThis._supabaseInstance = null;
  }
  
  if (!globalThis._supabaseInstance) {
    globalThis._supabaseInstance = createSupabaseClient();
  }
  return globalThis._supabaseInstance!;
}

export function getSupabase(): SupabaseClient {
  return getSupabaseInstance();
}

// Lazy export - only initializes when actually used (not during SSR)
export const supabase = typeof window === 'undefined' 
  ? null as unknown as SupabaseClient
  : getSupabase();
