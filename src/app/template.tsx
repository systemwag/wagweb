'use client';

import { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  // Этот компонент оборачивает каждую страницу (роут).
  // При смене url Next.js перерендеривает Template с новым key,
  // что вызывает перезапуск CSS-анимации .page-transition-wrapper
  return (
    <div className="page-transition-wrapper">
      {children}
    </div>
  );
}
