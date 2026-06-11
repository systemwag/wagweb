import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase-server';
import { requireAdmin, errorMessage, dbErrorMessage } from '@/lib/admin-auth';
import { DesignProjectUpdateSchema, parseOr400 } from '@/lib/admin-schemas';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const parsed = parseOr400(DesignProjectUpdateSchema, await req.json());
    if ('error' in parsed) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('design_projects').update(parsed.data).eq('id', Number(id)).select().single();
    if (error) return NextResponse.json({ ok: false, error: dbErrorMessage(error) }, { status: 400 });
    revalidatePath('/design');
    revalidatePath(`/design/${parsed.data.slug ?? id}`);
    return NextResponse.json({ ok: true, project: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const supabase = createServiceClient();
    const { error } = await supabase.from('design_projects').delete().eq('id', Number(id));
    if (error) return NextResponse.json({ ok: false, error: dbErrorMessage(error) }, { status: 400 });
    revalidatePath('/design');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}
