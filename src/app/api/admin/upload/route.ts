import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
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

// The client-supplied MIME type is spoofable — verify the actual file
// signature (magic bytes) matches the declared type before accepting.
function matchesMagicBytes(buf: Buffer, mime: string): boolean {
  if (buf.length < 12) return false;
  switch (mime) {
    case 'image/jpeg':
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case 'image/png':
      return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case 'image/webp':
      return buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP';
    case 'image/avif':
      return buf.subarray(4, 8).toString('ascii') === 'ftyp';
    default:
      return false;
  }
}

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

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!matchesMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { ok: false, error: 'Содержимое файла не соответствует заявленному формату' },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Generate unique path. Extension comes from the validated MIME type, and
    // the folder only accepts a numeric project id (no path traversal).
    const ext = MIME_EXT[file.type] ?? 'jpg';
    const timestamp = Date.now();
    const folder = projectId && /^\d+$/.test(projectId) ? `project-${projectId}` : 'unsorted';
    const filePath = `${folder}/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
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

    const supabase = createServiceClient();
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
