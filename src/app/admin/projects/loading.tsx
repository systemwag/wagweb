import styles from '@/components/Admin/admin.module.css';

export default function AdminProjectsLoading() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <div style={{ width: 120, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />
          <div style={{ width: 140, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
      <div className={styles.tableWrap} style={{ opacity: 0.5 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ height: 52, borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 ? 'rgba(255,255,255,0.01)' : 'transparent' }} />
        ))}
      </div>
    </div>
  );
}
