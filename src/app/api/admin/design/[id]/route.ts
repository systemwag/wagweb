import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('design_projects').update(body).eq('id', Number(id)).select().single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    revalidatePath('/design');
    revalidatePath(`/design/${id}`);
    return NextResponse.json({ ok: true, project: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { error } = await supabase.from('design_projects').delete().eq('id', Number(id));
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    revalidatePath('/design');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
