'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './licenses.module.css';

/* Формулировки — дословно со свидетельств об аккредитации (public/licenses/accr-*.jpg).
   Все свидетельства выданы 26.06.2026, действуют до 26.06.2028. */
const accreditations = [
  {
    number: 'KZ83VWC00283699',
    scope:
      'Экспертные работы по техническому обследованию надёжности и устойчивости зданий и сооружений на технически и технологически сложных объектах',
    level: 'I и II уровни ответственности',
    holder: 'ТОО «West Arlan Group»',
    authority: 'Комитет по делам строительства и ЖКХ Минпромстроя РК',
    file: '/licenses/accr-tech-survey.jpg',
  },
  {
    number: 'KZ56VWC00283700',
    scope:
      'Инжиниринговые услуги по техническому надзору на технически и технологически сложных объектах',
    level: 'I уровень ответственности',
    holder: 'ТОО «West Arlan Group»',
    authority: 'Комитет по делам строительства и ЖКХ Минпромстроя РК',
    file: '/licenses/accr-supervision-wag.jpg',
  },
  {
    number: 'KZ29VWC00283701',
    scope:
      'Управление проектами в области архитектуры, градостроительства и строительства',
    level: 'Внесено в реестр услугодателя',
    holder: 'ТОО «West Arlan Group»',
    authority: 'ГАСК Актюбинской области',
    file: '/licenses/accr-project-mgmt.jpg',
  },
  {
    number: 'KZ02VWC00283702',
    scope:
      'Инжиниринговые услуги по техническому надзору на технически и технологически сложных объектах',
    level: 'I уровень ответственности',
    holder: 'ТОО «Global Construction Project» — член группы',
    authority: 'Комитет по делам строительства и ЖКХ Минпромстроя РК',
    file: '/licenses/accr-supervision-gcp.jpg',
  },
];

export default function AccreditationCards() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <div className={styles.accrGrid}>
        {accreditations.map((a) => (
          <button
            key={a.number}
            type="button"
            className={`glass-card ${styles.accrCard}`}
            onClick={() => setOpen(a.file)}
            aria-label={`Открыть свидетельство об аккредитации № ${a.number}`}
          >
            <div className={styles.certImageWrap}>
              <Image
                src={a.file}
                alt={`Свидетельство об аккредитации № ${a.number}`}
                width={400}
                height={540}
                unoptimized
              />
            </div>
            <span className={styles.accrNumber}>№ {a.number}</span>
            <p className={styles.accrScope}>{a.scope}</p>
            <dl className={styles.licMeta}>
              <div className={styles.licMetaRow}>
                <dt>Уровень</dt>
                <dd>{a.level}</dd>
              </div>
              <div className={styles.licMetaRow}>
                <dt>Держатель</dt>
                <dd>{a.holder}</dd>
              </div>
              <div className={styles.licMetaRow}>
                <dt>Срок действия</dt>
                <dd>до 26.06.2028</dd>
              </div>
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
            alt={`Свидетельство об аккредитации ${
              accreditations.find((a) => a.file === open)?.number ?? ''
            }`}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
