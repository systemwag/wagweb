import Link from 'next/link';
import styles from './error-pages.module.css';

export const metadata = { title: 'Страница не найдена' };

export default function NotFound() {
  return (
    <main className={styles.wrap}>
      <span className="section-label">Ошибка 404</span>
      <h1 className="heading-1">
        Страница <span className="text-gradient-gold">не найдена</span>
      </h1>
      <p className={styles.desc}>
        Возможно, объект был перемещён или адрес введён с ошибкой.
      </p>
      <div className={styles.actions}>
        <Link href="/" className="btn btn-primary">На главную</Link>
        <Link href="/projects" className="btn btn-outline">Наши проекты</Link>
      </div>
    </main>
  );
}
