'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './licenses.module.css';

/* Реквизиты сверены со скан-копиями (public/licenses/) 2026-07-16. */
const licenses = [
  {
    title: 'Строительно-монтажные работы',
    badge: 'I категория',
    number: '25008103',
    meta: [
      { label: 'Выдана', value: '14.03.2025' },
      { label: 'Первичная выдача', value: '13.07.2010' },
      { label: 'Срок действия', value: 'Бессрочная · класс 1' },
      { label: 'Лицензиар', value: 'ГАСК Актюбинской области' },
    ],
    file: '/licenses/license-smr.jpg',
  },
  {
    title: 'Проектная деятельность',
    badge: 'I категория',
    number: '25031072',
    meta: [
      { label: 'Выдана', value: '05.09.2025' },
      { label: 'Первичная выдача', value: '28.04.2010' },
      { label: 'Срок действия', value: 'Бессрочная · класс 1' },
      { label: 'Лицензиар', value: 'ГАСК Актюбинской области' },
    ],
    file: '/licenses/license-pd-2025.jpg',
  },
  {
    title: 'Охрана окружающей среды',
    badge: 'Работы и услуги',
    number: '02962Р',
    meta: [
      { label: 'Выдана', value: '22.09.2025 · г. Астана' },
      { label: 'Срок действия', value: 'Неотчуждаемая · класс 1' },
      { label: 'Лицензиар', value: 'Минэкологии и природных ресурсов РК' },
      { label: 'Область', value: 'Работы и услуги в области охраны окружающей среды' },
    ],
    file: '/licenses/license-eco.jpg',
  },
];

export default function LicenseCards() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <div className={styles.licGrid}>
        {licenses.map((lic) => (
          <button
            key={lic.number}
            type="button"
            className={`glass-card ${styles.licCard}`}
            onClick={() => setOpen(lic.file)}
            aria-label={`Открыть скан лицензии: ${lic.title}`}
          >
            <div className={styles.certImageWrap}>
              <Image
                src={lic.file}
                alt={`Лицензия: ${lic.title}`}
                width={400}
                height={540}
                unoptimized
              />
            </div>
            <div className={styles.licHead}>
              <span className={styles.licBadge}>{lic.badge}</span>
              <span className={styles.licNumber}>№ {lic.number}</span>
            </div>
            <h3 className={styles.cardTitle}>{lic.title}</h3>
            <dl className={styles.licMeta}>
              {lic.meta.map((m) => (
                <div key={m.label} className={styles.licMetaRow}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
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
            alt={licenses.find((l) => l.file === open)?.title ?? 'Лицензия'}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
