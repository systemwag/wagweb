import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase-server';
import { requireAdmin, errorMessage, dbErrorMessage } from '@/lib/admin-auth';
import { PartnerSchema, parseOr400 } from '@/lib/admin-schemas';

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const parsed = parseOr400(PartnerSchema, await req.json());
    if ('error' in parsed) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

    const supabase = createServiceClient();
    const { data, error } = await supabase.from('partners').insert([parsed.data]).select().single();
    if (error) return NextResponse.json({ ok: false, error: dbErrorMessage(error) }, { status: 400 });
    revalidatePath('/');
    return NextResponse.json({ ok: true, partner: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}
