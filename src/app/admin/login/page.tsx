'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();

      if (json.ok) {
        router.push('/admin/projects');
        router.refresh();
      } else {
        setError(json.error ?? 'Неверный пароль');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
            <polygon points="18,2 34,10 34,26 18,34 2,26 2,10"
              stroke="url(#lg)" strokeWidth="1.5" fill="none"/>
            <polygon points="18,8 28,13 28,23 18,28 8,23 8,13"
              fill="url(#lg)" opacity="0.12"/>
            <text x="18" y="22" textAnchor="middle"
              fontFamily="Outfit, sans-serif" fontWeight="800"
              fontSize="11" fill="url(#lg)">W</text>
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D4A843"/>
                <stop offset="100%" stopColor="#F0C85A"/>
              </linearGradient>
            </defs>
          </svg>
          <span className={styles.logoText}>WAG Admin</span>
        </div>

        <h1 className={styles.title}>Авторизация</h1>
        <p className={styles.subtitle}>Введите пароль для доступа к панели управления</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <input
            type="password"
            className={styles.input}
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            required
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Проверка...' : 'Войти'}
          </button>
        </form>

        <a href="/" className={styles.backLink}>
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
            <path d="M13 8H3M7 12L3 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          На сайт
        </a>
      </div>
    </div>
  );
}
