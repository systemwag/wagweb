import type { Metadata } from 'next';
import { getProjects, getMaintenanceProjects, getDesignProjects } from '@/lib/data';
import View from './View';

export const metadata: Metadata = {
  title: '3D-полигон — как мы строим: от изысканий до обслуживания',
  description:
    'Интерактивный 3D-полигон West Arlan Group: изыскания и проектирование с сопровождением ГосЭкспертизы, автодороги и рельсовые пути с переездом, инженерные сети, промышленные объекты и обслуживание после сдачи.',
  /* Визуальный полигон, а не страница сайта — см. комментарий в
     src/app/construction-3d/page.tsx. */
  robots: { index: false, follow: false },
};

export default async function Construction3DClaudePage() {
  /* Числа в карточках этапов берём из тех же реестров, что питают
     /design, /projects и /maintenance. Иначе полигон начинает
     рассказывать клиенту свою арифметику, расходящуюся с сайтом. */
  const [projects, maintenance, design] = await Promise.all([
    getProjects(),
    getMaintenanceProjects(),
    getDesignProjects(),
  ]);

  return (
    <View
      counts={{
        build: projects.length,
        service: maintenance.length,
        design: design.length,
      }}
    />
  );
}
