import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/**
 * Browser-side Supabase client (lazy singleton).
 * Safe to import in Client Components.
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  _client = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder', {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  return _client;
}

// Convenience export for backwards compatibility
export const supabase = {
  from: (table: string) => getSupabaseClient().from(table),
};
