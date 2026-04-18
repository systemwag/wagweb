'use client';

import dynamic from 'next/dynamic';
import styles from './licenses.module.css';

const PdfPreview = dynamic(() => import('@/components/ui/PdfPreview'), { ssr: false });

const licenses = [
  {
    title: 'Лицензия на проектную деятельность',
    file: '/licenses/Лицензия проектной деятельности.pdf',
  },
  {
    title: 'Лицензия на СМР — I категория',
    file: '/licenses/Лицензия СМР 1-ой кат.pdf',
  },
  {
    title: 'Проектные работы WAG',
    file: '/licenses/Проектные работы WAG.pdf',
  },
  {
    title: 'Строительно-монтажные работы WAG',
    file: '/licenses/Строительно-монтажные работы WAG.pdf',
  },
];

export default function LicenseCards() {
  return (
    <div className={styles.grid}>
      {licenses.map((lic) => (
        <div key={lic.title} className={`glass-card ${styles.card}`}>
          <PdfPreview file={lic.file} title={lic.title} />
          <h3 className={styles.cardTitle}>{lic.title}</h3>
          <a
            href={lic.file}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-outline ${styles.cardBtn}`}
          >
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Открыть PDF
          </a>
        </div>
      ))}
    </div>
  );
}
