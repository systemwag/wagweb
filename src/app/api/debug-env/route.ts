import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    url_set: !!url,
    url_length: url?.length ?? 0,
    url_trimmed_length: url?.trim().length ?? 0,
    url_starts_with_https: url?.trim().startsWith('https://'),
    url_preview: url ? url.trim().slice(0, 40) + '...' : null,
    key_set: !!key,
    key_length: key?.length ?? 0,
    key_trimmed_length: key?.trim().length ?? 0,
    key_starts_with_eyJ: key?.trim().startsWith('eyJ'),
  });
}
