import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';

interface CoordUpdate {
  id: number;
  x_map: number | null;
  y_map: number | null;
}

export async function POST(req: Request) {
  try {
    const updates: CoordUpdate[] = await req.json();
    const supabase = createServerClient();

    const results = await Promise.all(
      updates.map(({ id, x_map, y_map }) =>
        supabase.from('projects').update({ x_map, y_map }).eq('id', id)
      )
    );

    const errors = results.filter(r => r.error).map(r => r.error?.message);
    if (errors.length) {
      return NextResponse.json({ ok: false, errors }, { status: 500 });
    }

    revalidatePath('/');
    revalidatePath('/projects');

    return NextResponse.json({ ok: true, supabase: true, updated: updates.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
