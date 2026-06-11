import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase-server';
import { requireAdmin, errorMessage, dbErrorMessage } from '@/lib/admin-auth';
import { MapCoordsSchema, parseOr400 } from '@/lib/admin-schemas';

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const parsed = parseOr400(MapCoordsSchema, await req.json());
    if ('error' in parsed) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

    const supabase = createServiceClient();

    const results = await Promise.all(
      parsed.data.map(({ id, x_map, y_map }) =>
        supabase.from('projects').update({ x_map, y_map }).eq('id', id)
      )
    );

    const errors = results.filter(r => r.error).map(r => dbErrorMessage(r.error!));
    if (errors.length) {
      return NextResponse.json({ ok: false, errors }, { status: 500 });
    }

    revalidatePath('/');
    revalidatePath('/projects');

    return NextResponse.json({ ok: true, supabase: true, updated: parsed.data.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}
