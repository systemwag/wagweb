'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { NewsVideo } from '@/lib/news';
import styles from './article.module.css';

/**
 * Фасад YouTube: до клика на странице только локальный постер, никакого
 * обращения к серверам Google. Плеер подставляется по клику — так страница
 * не тянет ~1 МБ чужого JS ради видео, которое посмотрят не все.
 *
 * Домен youtube-nocookie.com; он же прописан в `frame-src` CSP
 * (next.config.ts) — без этого iframe просто не отрисуется.
 */
export default function VideoEmbed({ video }: { video: NewsVideo }) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className={styles.video}>
      <div className={styles.videoFrame}>
        {playing ? (
          <iframe
            className={styles.videoIframe}
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.videoPoster}
            onClick={() => setPlaying(true)}
            aria-label={`Воспроизвести видео: ${video.title}`}
          >
            <Image
              src={video.poster}
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1200px"
              className={styles.videoPosterImg}
            />
            <span className={styles.videoPlay} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                <path d="M8 5.5v13l11-6.5-11-6.5z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <figcaption className={styles.videoCaption}>
        <span>{video.caption ?? video.title}</span>
        <a
          className={styles.videoLink}
          href={`https://youtu.be/${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Смотреть на YouTube
          <svg viewBox="0 0 16 16" fill="none" width="12" height="12" aria-hidden="true">
            <path d="M6 3h7v7M13 3L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </figcaption>
    </figure>
  );
}
