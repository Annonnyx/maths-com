import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fnoezpxrbqaxzwdgqppv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZub2V6cHhyYnFheHp3ZGdxcHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzI0NzIsImV4cCI6MjA1MzY0ODQ3Mn0.0G1XxP5R2L8Km9N7QJ3fW1E4cT5yU6i8O2pL9kM4nB7';

// Singleton pattern to avoid multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
  },
});

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
      },
    });
  }
  return supabaseInstance;
}
