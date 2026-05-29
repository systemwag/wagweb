import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin, errorMessage } from '@/lib/admin-auth';

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const supabase = createServerClient();
    const { data, error } = await supabase.from('maintenance_projects').insert([body]).select().single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    revalidatePath('/maintenance');
    return NextResponse.json({ ok: true, project: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}
