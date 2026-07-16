'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';

interface FormState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export default function ContactForm() {
  const [state, setState] = useState<FormState>({ status: 'idle', message: '' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: 'loading', message: '' });

    const form = e.currentTarget;
    const workType = (form.elements.namedItem('workType') as HTMLSelectElement).value;
    const rawMessage = (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim();
    const data = {
      name:    (form.elements.namedItem('name')    as HTMLInputElement).value.trim(),
      email:   (form.elements.namedItem('email')   as HTMLInputElement).value.trim(),
      phone:   (form.elements.namedItem('phone')   as HTMLInputElement).value.trim(),
      // Тип работ уходит в начале сообщения — без изменения схемы API/БД.
      message: workType ? `[${workType}] ${rawMessage}` : rawMessage,
      website: (form.elements.namedItem('website') as HTMLInputElement).value,
    };

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      setState({ status: 'error', message: 'Пожалуйста, заполните все обязательные поля.' });
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setState({
          status: 'error',
          message: json?.error || 'Произошла ошибка при отправке. Пожалуйста, позвоните нам напрямую.',
        });
        return;
      }

      setState({
        status: 'success',
        message: 'Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.',
      });
      form.reset();
    } catch {
      setState({
        status: 'error',
        message: 'Произошла ошибка при отправке. Пожалуйста, позвоните нам напрямую.',
      });
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Имя <span className={styles.required}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={styles.input}
            placeholder="Ваше имя"
            required
            disabled={state.status === 'loading' || state.status === 'success'}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email <span className={styles.required}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            placeholder="email@company.kz"
            required
            disabled={state.status === 'loading' || state.status === 'success'}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="phone" className={styles.label}>
          Телефон
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className={styles.input}
          placeholder="+7 (___) ___-__-__"
          disabled={state.status === 'loading' || state.status === 'success'}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="workType" className={styles.label}>
          Тип работ
        </label>
        <select
          id="workType"
          name="workType"
          className={styles.input}
          defaultValue=""
          disabled={state.status === 'loading' || state.status === 'success'}
        >
          <option value="">Не выбран</option>
          <option value="Проектирование">Проектирование и изыскания</option>
          <option value="СМР">Строительно-монтажные работы</option>
          <option value="Обслуживание">Обслуживание и текущее содержание</option>
          <option value="Технадзор">Технадзор / обследование зданий</option>
          <option value="Другое">Другое</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>
          Сообщение <span className={styles.required}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          className={styles.textarea}
          placeholder="Опишите ваш проект или задайте вопрос..."
          rows={5}
          required
          disabled={state.status === 'loading' || state.status === 'success'}
        />
      </div>

      {/* Honeypot: invisible to humans, bots tend to fill it. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Не заполняйте это поле</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message && (
        <div className={`${styles.feedback} ${styles[`feedback_${state.status}`]}`}>
          {state.status === 'success' && <span className={styles.feedbackIcon}>✓</span>}
          {state.status === 'error'   && <span className={styles.feedbackIcon}>!</span>}
          {state.message}
        </div>
      )}

      <button
        type="submit"
        className={`btn btn-primary ${styles.submit}`}
        disabled={state.status === 'loading' || state.status === 'success'}
      >
        {state.status === 'loading' ? (
          <>
            <span className={styles.spinner} />
            Отправка...
          </>
        ) : state.status === 'success' ? (
          '✓ Заявка отправлена'
        ) : (
          <>
            Отправить заявку
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </>
        )}
      </button>

      <p className={styles.privacy}>
        Нажимая кнопку, вы соглашаетесь с{' '}
        <a href="/privacy">политикой конфиденциальности</a>.
      </p>
    </form>
  );
}
