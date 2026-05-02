'use client';

import styles from './print.module.css';

export default function PrintButtons() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.printButtons}>
      <button type="button" className={styles.printBtnPrimary} onClick={handlePrint}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Сохранить как PDF
      </button>
      <button type="button" className={styles.printBtnSecondary} onClick={handlePrint}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        Печать
      </button>
      <div className={styles.printHintNote}>
        В диалоге печати включите<br />
        «Background graphics»
      </div>
    </div>
  );
}
