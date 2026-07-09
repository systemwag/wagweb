import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * Default og:image for every page (1200×630). Statically generated at build.
 * Uses local NotoSans (Cyrillic-capable) — satori can't use next/font.
 */
export const alt = 'West Arlan Group — проектирование и строительство инфраструктуры в Казахстане';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [notoBold, notoRegular] = await Promise.all([
    readFile(path.join(process.cwd(), 'public', 'fonts', 'noto', 'NotoSans-Bold.ttf')),
    readFile(path.join(process.cwd(), 'public', 'fonts', 'noto', 'NotoSans-Regular.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #04060C 0%, #070B16 60%, #0A1020 100%)',
          color: '#F0F2F8',
          fontFamily: 'Noto Sans',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '26px solid transparent',
              borderRight: '26px solid transparent',
              borderBottom: '44px solid #D4A843',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 6 }}>WEST ARLAN GROUP</div>
            <div style={{ fontSize: 18, color: '#8892A4', letterSpacing: 3 }}>
              ИНЖИНИРИНГ · КАЗАХСТАН
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15, maxWidth: 980 }}>
            Проектируем. Строим. Обслуживаем.
          </div>
          <div style={{ fontSize: 26, color: '#8892A4', maxWidth: 900 }}>
            Инженерная и транспортная инфраструктура — полный цикл от изысканий до
            сдачи «под ключ»
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid rgba(212,168,67,0.45)',
            paddingTop: 28,
          }}
        >
          <div style={{ fontSize: 22, color: '#D4A843', letterSpacing: 2 }}>westarlangroup.kz</div>
          <div style={{ fontSize: 20, color: '#8892A4' }}>136 объектов · 16 лет · ISO 9001</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Noto Sans', data: notoBold, weight: 700, style: 'normal' },
        { name: 'Noto Sans', data: notoRegular, weight: 400, style: 'normal' },
      ],
    },
  );
}
