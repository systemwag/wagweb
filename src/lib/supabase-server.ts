import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client.
 * Use ONLY in Server Components, Route Handlers, and Server Actions.
 * Never import this in Client Components ('use client').
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  return createClient(url, key, {
    auth: {
      // No cookie persistence needed for server-only reads
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
