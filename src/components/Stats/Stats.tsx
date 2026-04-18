'use client';

import styles from './Stats.module.css';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
  color: 'gold' | 'teal' | 'blue' | 'white';
}

const stats: StatItem[] = [
  { value: 15,  suffix: '+', label: 'Лет на рынке',      sublabel: 'С 2010 года',              color: 'gold'  },
  { value: 300, suffix: '+', label: 'Объектов сдано',    sublabel: 'По всему Казахстану',       color: 'teal'  },
  { value: 2800,suffix: '+', label: 'км дорог',          sublabel: 'Железнодорожных путей',     color: 'blue'  },
  { value: 98,  suffix: '%', label: 'Довольных клиентов',sublabel: 'Повторные обращения',       color: 'white' },
];

function StatCard({ item, index }: { item: StatItem; index: number }) {
  return (
    <div
      className={`glass-card ${styles.card} ${styles[`card_${item.color}`]}`}
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div className={styles.cardGlow} aria-hidden="true" />
      <div className={styles.valueRow}>
        <AnimatedCounter 
          target={item.value} 
          className={`${styles.value} ${styles[`value_${item.color}`]}`} 
          duration={2500} 
        />
        <span className={`${styles.suffix} ${styles[`value_${item.color}`]}`}>{item.suffix}</span>
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
            <StatCard key={item.label} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
