import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Check if we're in build/SSR environment without proper env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isBuildTime = !supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || 
                    !supabaseAnonKey || supabaseAnonKey === 'placeholder';

// Create mock client for build time that returns empty responses
function createMockClient(): SupabaseClient {
  const mockChain = {
    select: () => mockChain,
    insert: () => mockChain,
    update: () => mockChain,
    delete: () => mockChain,
    eq: () => mockChain,
    neq: () => mockChain,
    gt: () => mockChain,
    gte: () => mockChain,
    lt: () => mockChain,
    lte: () => mockChain,
    like: () => mockChain,
    ilike: () => mockChain,
    is: () => mockChain,
    in: () => mockChain,
    contains: () => mockChain,
    containedBy: () => mockChain,
    range: () => mockChain,
    overlaps: () => mockChain,
    textSearch: () => mockChain,
    match: () => mockChain,
    not: () => mockChain,
    or: () => mockChain,
    and: () => mockChain,
    filter: () => mockChain,
    order: () => mockChain,
    limit: () => mockChain,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    csv: () => Promise.resolve(''),
    then: (callback: any) => Promise.resolve({ data: [], error: null }).then(callback),
  } as any;

  return {
    from: () => mockChain,
    rpc: () => Promise.resolve({ data: null, error: null }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => {},
    removeAllChannels: () => {},
    getChannels: () => [],
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: null }),
      updateUser: () => Promise.resolve({ data: null, error: null }),
      setSession: () => Promise.resolve({ data: null, error: null }),
      exchangeCodeForSession: () => Promise.resolve({ data: null, error: null }),
    },
    realtime: { setAuth: () => {} },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        getSignedUrl: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
        list: () => Promise.resolve({ data: [], error: null }),
        move: () => Promise.resolve({ data: null, error: null }),
        copy: () => Promise.resolve({ data: null, error: null }),
        createSignedUrl: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
      }),
    },
    functions: {
      invoke: () => Promise.resolve({ data: null, error: null }),
    },
  } as unknown as SupabaseClient;
}

// Create the actual Supabase client or mock
export const supabase = isBuildTime 
  ? createMockClient()
  : createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
      },
    });

// Also export a getter for server-side usage
export function getSupabase() {
  return supabase;
}
