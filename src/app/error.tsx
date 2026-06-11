'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error-pages.module.css';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app] unhandled error:', error);
  }, [error]);

  return (
    <main className={styles.wrap}>
      <span className="section-label">Ошибка</span>
      <h1 className="heading-1">
        Что-то пошло <span className="text-gradient-gold">не так</span>
      </h1>
      <p className={styles.desc}>
        Произошла непредвиденная ошибка. Попробуйте обновить страницу — или
        вернитесь чуть позже.
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={reset} className="btn btn-primary">
          Попробовать снова
        </button>
        <Link href="/" className="btn btn-outline">На главную</Link>
      </div>
    </main>
  );
}
