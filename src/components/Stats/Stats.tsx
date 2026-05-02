'use client';

import styles from './Stats.module.css';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
}

const stats: StatItem[] = [
  { value: 15, suffix: '+', label: 'Лет на рынке',         sublabel: 'с 2010 года'                },
  { value: 80, suffix: '+', label: 'Специалистов',         sublabel: 'ГИПы, инженеры, прорабы'    },
  { value: 14, suffix: '',  label: 'Регионов Казахстана',  sublabel: 'от Атырау до Хоргоса'       },
  { value: 94, suffix: '%', label: 'Повторных контрактов', sublabel: 'клиенты возвращаются'       },
];

const regalia = [
  'I категория',
  'ISO 9001:2015',
  'ISO 14001:2015',
  'Допуск СРО',
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

export default function Stats() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>

        <div className={styles.grid}>
          {stats.map((item, i) => (
            <StatCell key={item.label} item={item} index={i} />
          ))}
        </div>

        <div className={styles.regalia} aria-label="Лицензии и сертификаты">
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
