import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { ContactSubmissionSchema, parseOr400 } from '@/lib/admin-schemas';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { notifyNewLead } from '@/lib/notify';

/**
 * POST /api/contact — public lead-form endpoint.
 * Replaces the previous direct browser→Supabase insert so that the anon key
 * needs no write access at all (see supabase/rls-policies.sql) and leads can
 * trigger a Telegram notification server-side.
 */
export async function POST(req: Request) {
  try {
    if (!rateLimit(`contact:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: 'Слишком много заявок. Попробуйте позже или позвоните нам.' },
        { status: 429 },
      );
    }

    const parsed = parseOr400(ContactSubmissionSchema, await req.json());
    if ('error' in parsed) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    // Honeypot filled → pretend success, store nothing.
    if (parsed.data.website) return NextResponse.json({ ok: true });

    const lead = {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    };

    const supabase = createServiceClient();
    const { error } = await supabase.from('contacts').insert([lead]);

    // Missing table is tolerated (pre-migration installs) — the Telegram
    // notification below still delivers the lead.
    if (error && error.code !== '42P01') {
      console.error('[contact] insert failed:', error.code, error.message);
      return NextResponse.json(
        { ok: false, error: 'Не удалось отправить заявку. Позвоните нам напрямую.' },
        { status: 500 },
      );
    }

    try {
      await notifyNewLead(lead);
    } catch (e) {
      console.error('[contact] notification failed:', e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[contact] unhandled:', e);
    return NextResponse.json(
      { ok: false, error: 'Не удалось отправить заявку. Позвоните нам напрямую.' },
      { status: 500 },
    );
  }
}
