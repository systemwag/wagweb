'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import type { NewsPhoto } from '@/lib/news';
import styles from './article.module.css';

/**
 * Фоторепортаж: сетка миниатюр + полноэкранный просмотр.
 *
 * Лайтбокс — отдельное состояние, а не :target/CSS, потому что нужны
 * стрелки, Esc и возврат фокуса на ту миниатюру, с которой открыли.
 *
 * Рисуется порталом в <body>: глобальный `.page-transition-wrapper`
 * (globals.css) объявляет `will-change: opacity, transform`, а это делает
 * его containing block для `position: fixed` — оверлей внутри страницы
 * растянулся бы на всю высоту документа вместо вьюпорта.
 */
export default function NewsGallery({ photos }: { photos: NewsPhoto[] }) {
  const [active, setActive] = useState<number | null>(null);
  const thumbsRef = useRef<(HTMLButtonElement | null)[]>([]);
  /** Кто открыл лайтбокс — туда и вернём фокус при закрытии. */
  const openerRef = useRef<number | null>(null);

  const close = useCallback(() => {
    setActive(null);
    const idx = openerRef.current;
    openerRef.current = null;
    if (idx !== null) thumbsRef.current[idx]?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => setActive((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (active === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
    };

    window.addEventListener('keydown', onKey);
    // Фон не должен прокручиваться под открытым лайтбоксом
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [active, close, step]);

  if (photos.length === 0) return null;

  const current = active === null ? null : photos[active];

  return (
    <>
      <div className={styles.gallery}>
        {photos.map((photo, idx) => (
          <button
            key={photo.src}
            type="button"
            ref={(el) => { thumbsRef.current[idx] = el; }}
            className={styles.thumb}
            onClick={() => { openerRef.current = idx; setActive(idx); }}
            aria-label={`Открыть фото ${idx + 1} из ${photos.length}: ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              className={styles.thumbImg}
            />
            <span className={styles.thumbZoom} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3.5 3.5M7 5v4M5 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {/* `current` не бывает непустым на сервере — портал только после клика */}
      {current && createPortal(
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          onClick={close}
        >
          <button
            type="button"
            className={styles.lbClose}
            onClick={close}
            aria-label="Закрыть"
            autoFocus
          >
            <svg viewBox="0 0 14 14" fill="none" width="16" height="16">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              className={`${styles.lbNav} ${styles.lbPrev}`}
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label="Предыдущее фото"
            >
              <svg viewBox="0 0 16 16" fill="none" width="18" height="18">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Клик по самому кадру не закрывает — только по подложке */}
          <figure className={styles.lbFigure} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lbImgWrap}>
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="(max-width: 900px) 100vw, 85vw"
                className={styles.lbImg}
                priority
              />
            </div>
            <figcaption className={styles.lbCaption}>
              <span>{current.caption ?? current.alt}</span>
              <span className={styles.lbCounter}>{(active ?? 0) + 1} / {photos.length}</span>
            </figcaption>
          </figure>

          {photos.length > 1 && (
            <button
              type="button"
              className={`${styles.lbNav} ${styles.lbNext}`}
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label="Следующее фото"
            >
              <svg viewBox="0 0 16 16" fill="none" width="18" height="18">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
