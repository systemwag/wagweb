import styles from './Map.module.css';
import type { Project } from '@/lib/types';

interface MapPopupProps {
  project: Project | null;
  left: string;
  top: string;
  visible: boolean;
}

const statusMap: Record<string, string> = {
  'completed':  'Завершён',
  'in-progress': 'В процессе',
  'planned':    'Планируется',
};

export default function MapPopup({ project, left, top, visible }: MapPopupProps) {
  if (!project) return null;

  return (
    <div
      className={`${styles.popup} ${visible ? styles.visible : ''}`}
      style={{ left, top }}
    >
      <span className={styles.popupCategory}>{project.category}</span>
      <h3 className={styles.popupTitle}>{project.title}</h3>
      <p className={styles.popupDesc}>{project.description}</p>

      <div className={styles.popupMeta}>
        <span className={styles.popupLocation}>{project.location}</span>
        {project.coords_label && (
          <span className={styles.popupCoords}>{project.coords_label}</span>
        )}
      </div>

      <div className={styles.popupStatusWrap}>
        <span className={`${styles.statusIndicator} ${styles[project.status]}`} />
        <span className={styles.statusText}>{statusMap[project.status] ?? project.status}</span>
      </div>
    </div>
  );
}
