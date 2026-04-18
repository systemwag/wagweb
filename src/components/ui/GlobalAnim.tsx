'use client';

import { useEffect } from 'react';

export default function GlobalAnim() {
  useEffect(() => {
    // 1. Ищем все элементы, которые мы хотим анимировать
    // Мы можем анимировать заголовки, карточки стеклянные эффекты, кнопки, списки.
    const selectors = [
      'h2', 
      'h3', 
      '.glass-card', 
      '[class*="dirCard"]', 
      '[class*="serviceCard"]',
      '.btn-outline',
      '.btn-primary',
      'p',
      'li'
    ].join(', ');

    const elements = document.querySelectorAll(selectors);

    // 2. Готовим элементы для скролл-анимации, если они не в Hero-секции
    elements.forEach((el) => {
      // Игнорируем элементы Hero блока, у них своя стартовая анимация
      if (!el.closest('[class*="hero"]')) {
        el.classList.add('anim-el');
      }
    });

    // 3. Создаем Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Вычисляем случайную или поочередную задержку, если элементов в одном ряду несколько
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target); // анимируем только 1 раз
        }
      });
    }, {
      threshold: 0.15, // элемент должен появиться на 15% чтобы начать анимацию
      rootMargin: "0px 0px -50px 0px"
    });

    // 4. Подключаем элементы к Observer
    const animElements = document.querySelectorAll('.anim-el');
    animElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
