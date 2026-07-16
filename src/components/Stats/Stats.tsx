'use client';

import styles from './Stats.module.css';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
}

interface StatsProps {
  /** Объектов и работ в реестре (СМР + обслуживание + проектирование), из data.ts */
  registryTotal: number;
  /** Полных лет на рынке, считается от 2010 */
  years: number;
}

/* Регалии — только подтверждённое документами (сканы в public/licenses/) */
const regalia = [
  'СМР — I категория',
  'Проектирование — I категория',
  'Технадзор — I уровень',
  'Обследование зданий — I–II уровни',
];

function StatCell({ item, index }: { item: StatItem; index: number }) {
  return (
    <div
      className={styles.cell}
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div className={styles.valueRow}>
        <AnimatedCounter
          target={item.value}
          className={styles.value}
          duration={2500}
        />
        <span className={styles.suffix}>{item.suffix}</span>
      </div>
      <div className={styles.label}>{item.label}</div>
      <div className={styles.sublabel}>{item.sublabel}</div>
    </div>
  );
}

export default function Stats({ registryTotal, years }: StatsProps) {
  const stats: StatItem[] = [
    { value: years,         suffix: '',  label: 'Лет на рынке',          sublabel: 'с 2010 года'                          },
    { value: registryTotal, suffix: '',  label: 'Объектов и работ',      sublabel: 'в публичном реестре'                  },
    { value: 80,            suffix: '+', label: 'Специалистов',          sublabel: 'ГИПы, инженеры, прорабы'              },
    { value: 2,             suffix: '',  label: 'Страны присутствия',    sublabel: 'Казахстан и Россия'                   },
  ];

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>

        <div className={styles.grid}>
          {stats.map((item, i) => (
            <StatCell key={item.label} item={item} index={i} />
          ))}
        </div>

        <div className={styles.regalia} aria-label="Лицензии и аккредитации">
          {regalia.map((item, i) => (
            <span key={item} className={styles.regaliaWrap}>
              <span className={styles.regaliaItem}>{item}</span>
              {i < regalia.length - 1 && (
                <span className={styles.regaliaSep} aria-hidden="true">·</span>
              )}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
