import type { Metadata } from 'next';
import ConstructionView from './ConstructionView';

export const metadata: Metadata = {
  title: '3D — строительство инфраструктуры: дороги, ж/д пути, сети',
  description:
    'Интерактивная 3D-история полного цикла West Arlan Group: проектирование, земляные работы, автодороги, ж/д пути и переезд, инженерные сети, промышленные объекты и подготовка документов для ГосЭкспертизы.',
};

export default function Construction3DPage() {
  return <ConstructionView />;
}
