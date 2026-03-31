import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plfjxxakrqxveufldtrc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZmp4eGFrcnF4dmV1ZmxkdHJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzMjE1NSwiZXhwIjoyMDg2NTA4MTU1fQ.ZBqdbXCpeGDyA8WdhxhWUOUyScahVV21jE8wnx2pvCM';

// Create Supabase client for API routes with cookies
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          cookie: cookieStore.toString(),
        },
      },
    }
  );
}
