'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './licenses.module.css';

const certificates = [
  {
    title: 'ISO 9001 — Система менеджмента качества (рус)',
    file: '/licenses/sertifikat-iso-9001-ru.webp',
  },
  {
    title: 'ISO 9001 — Сапа менеджмент жүйесі (каз)',
    file: '/licenses/sertifikat-iso-9001-kz.webp',
  },
  {
    title: 'ISO 9001:2016 — Менеджмент безопасности труда',
    file: '/licenses/sertifikat-iso-9001-2016.webp',
  },
  {
    title: 'Сертификат экологического менеджмента',
    file: '/licenses/sertifikat-ekologicheskiy-menedzhment.webp',
  },
];

export default function CertificateCards() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <div className={styles.certGrid}>
        {certificates.map((c) => (
          <button
            key={c.file}
            type="button"
            className={`glass-card ${styles.certCard}`}
            onClick={() => setOpen(c.file)}
            aria-label={`Открыть сертификат: ${c.title}`}
          >
            <div className={styles.certImageWrap}>
              <Image
                src={c.file}
                alt={c.title}
                width={400}
                height={540}
                unoptimized
              />
            </div>
            <span className={styles.certTitle}>{c.title}</span>
          </button>
        ))}
      </div>

      {open && (
        <div
          className={styles.lightbox}
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setOpen(null)}
            aria-label="Закрыть"
          >
            ✕
          </button>
          <img
            src={open}
            alt=""
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
