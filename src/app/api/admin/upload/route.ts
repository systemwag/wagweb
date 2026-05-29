import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin, errorMessage } from '@/lib/admin-auth';

const BUCKET = 'project-images';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
// Map of allowed MIME types → canonical extension. Deriving the extension
// from the (trusted, server-validated) MIME instead of the client filename
// avoids extension spoofing.
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};
const ALLOWED_TYPES = Object.keys(MIME_EXT);

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'Файл не выбран' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Допустимые форматы: JPEG, PNG, WebP, AVIF' },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { ok: false, error: 'Файл слишком большой (макс. 10 МБ)' },
        { status: 400 },
      );
    }

    const supabase = createServerClient();

    // Generate unique path. Extension comes from the validated MIME type, and
    // the folder only accepts a numeric project id (no path traversal).
    const ext = MIME_EXT[file.type] ?? 'jpg';
    const timestamp = Date.now();
    const folder = projectId && /^\d+$/.test(projectId) ? `project-${projectId}` : 'unsorted';
    const filePath = `${folder}/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { ok: false, error: `Ошибка загрузки: ${uploadError.message}` },
        { status: 500 },
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    return NextResponse.json({
      ok: true,
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { path } = await req.json();

    if (!path) {
      return NextResponse.json({ ok: false, error: 'Путь не указан' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase.storage.from(BUCKET).remove([path]);

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Ошибка удаления: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}
