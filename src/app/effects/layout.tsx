import type { Metadata } from 'next';

// /effects — внутренняя песочница визуальных экспериментов, не для индексации.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EffectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
