import styles from './loading.module.css';

export default function DesignLoading() {
  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.skLabel} />
        <div className={styles.skTitle} />
        <div className={styles.skDesc} />
      </div>
      <div className={styles.tableBlock}>
        <div className={styles.controls}>
          <div className={styles.skTabs} />
          <div className={styles.skSearch} />
        </div>
        <div className={styles.table}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.row} style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
