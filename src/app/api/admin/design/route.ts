import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createServerClient();
    const { data, error } = await supabase.from('design_projects').insert([body]).select().single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    revalidatePath('/design');
    return NextResponse.json({ ok: true, project: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
