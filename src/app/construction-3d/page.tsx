import type { Metadata } from 'next';
import ConstructionView from './ConstructionView';

export const metadata: Metadata = {
  title: '3D — строительство инфраструктуры: дороги, ж/д пути, сети',
  description:
    'Интерактивная 3D-история полного цикла West Arlan Group: проектирование, земляные работы, автодороги, ж/д пути и переезд, инженерные сети, промышленные объекты и подготовка документов для ГосЭкспертизы.',
  /* Визуальный полигон, а не страница сайта: из sitemap исключён, в robots.ts
     закрыт префиксом /construction-3d. noindex — вторая линия защиты, чтобы
     страница не попала в выдачу по прямой ссылке. */
  robots: { index: false, follow: false },
};

export default function Construction3DPage() {
  return <ConstructionView />;
}
