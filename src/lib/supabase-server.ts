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

/**
 * Privileged Supabase client (service role) for admin mutations — bypasses
 * RLS. Falls back to the anon key when SUPABASE_SERVICE_ROLE_KEY is unset
 * (pre-RLS setups keep working). NEVER import from client components.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key) in .env.local'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
