import styles from './loading.module.css';

export default function ProjectsLoading() {
  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.skLabel} />
        <div className={styles.skTitle} />
        <div className={styles.skDesc} />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.card} style={{ animationDelay: `${i * 0.07}s` }} />
        ))}
      </div>
    </div>
  );
}
