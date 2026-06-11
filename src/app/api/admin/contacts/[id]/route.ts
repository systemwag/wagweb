import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase-server';
import { requireAdmin, errorMessage, dbErrorMessage } from '@/lib/admin-auth';
import { parseOr400 } from '@/lib/admin-schemas';

const StatusSchema = z.object({ status: z.enum(['new', 'processed']) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const parsed = parseOr400(StatusSchema, await req.json());
    if ('error' in parsed) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

    const supabase = createServiceClient();
    const { error } = await supabase.from('contacts').update(parsed.data).eq('id', Number(id));
    if (error) return NextResponse.json({ ok: false, error: dbErrorMessage(error) }, { status: 400 });
    return NextResponse.json({ ok: true });
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
    const { error } = await supabase.from('contacts').delete().eq('id', Number(id));
    if (error) return NextResponse.json({ ok: false, error: dbErrorMessage(error) }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}
