import type { Metadata } from 'next';
import View from './View';

export const metadata: Metadata = {
  title: '3D-полигон — как мы строим: дороги, ж/д, сети, ГосЭкспертиза',
  description:
    'Интерактивный 3D-полигон West Arlan Group: техника вживую строит автодорогу и ж/д путь с переездом, прокладывает инженерные сети, возводит промышленные объекты — от изысканий до положительного заключения ГосЭкспертизы.',
};

export default function Construction3DClaudePage() {
  return <View />;
}
