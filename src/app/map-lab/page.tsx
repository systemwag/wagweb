import type { Metadata } from 'next';
import { getProjects, getMaintenanceProjects, getDesignProjects } from '@/lib/data';
import { buildGeoIndex } from '@/lib/geo/works';
import GeoMap from '@/components/GeoMap/GeoMap';
import styles from './map-lab.module.css';

export const metadata: Metadata = {
  title: 'Карта географии работ — черновик',
  robots: { index: false, follow: false },
};

export default async function MapLabPage() {
  const [projects, maintenance, design] = await Promise.all([
    getProjects(),
    getMaintenanceProjects(),
    getDesignProjects(),
  ]);

  const index = buildGeoIndex(projects, maintenance, design);

  return (
    <main className={styles.page}>
      <div className="container">
        <header className={styles.head}>
          <span className="section-label">Тестовая страница</span>
          <h1 className={`heading-2 ${styles.title}`}>
            Карта географии — <span className="text-gradient-gold">песочница</span>
          </h1>
          <p className={styles.lead}>
            Тот же модуль, что на главной, в /projects и в брошюре, но с отладочной
            панелью разбора адресов. Страница закрыта от индексации и нужна только
            для проверки данных — рабочая диагностика живёт в /admin/map.
          </p>
        </header>

        <GeoMap index={index} debug />

        <section className={styles.notes}>
          <h2 className={styles.notesTitle}>Чем отличается от прежней карты</h2>
          <ul className={styles.notesList}>
            <li>
              <b>Все три типа работ.</b> Раньше на карте были только СМР — 21 точка из
              32 записей. Сейчас {index.works.length} объектов из трёх разделов.
            </li>
            <li>
              <b>Координаты — настоящие.</b> Вместо пикселей <code>x_map/y_map</code>,
              привязанных к обведённому вручную контуру, — широта и долгота через
              справочник мест. Контур областей взят из OpenStreetMap с делением 2022 года.
            </li>
            <li>
              <b>Один маркер на точку присутствия.</b> Восемь площадок в Актобе больше
              не наслаиваются друг на друга — они раскрываются по клику.
            </li>
            <li>
              <b>Новый объект не требует калибровки.</b> Адрес разбирается по тексту;
              руками добавляется только новое место, которого ещё не было.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
