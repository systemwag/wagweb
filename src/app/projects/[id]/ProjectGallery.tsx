'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './project.module.css';

/**
 * Галерея фотографий объекта.
 *
 * Раньше миниатюры отрисовывались из серверного компонента обычными <div>
 * с `cursor: pointer` в стилях, но без обработчика — кликать было некуда,
 * и посетитель всегда видел только первый кадр. Переключение требует
 * состояния, поэтому галерея вынесена в клиентский компонент.
 *
 * Главное фото (`image_url`) может не входить в массив `images` — например,
 * у ПЗТМ это отдельный кадр со стройплощадки. Поэтому список собирается
 * из обоих источников с удалением повторов.
 */
export default function ProjectGallery({
  mainImage,
  images,
  title,
}: {
  mainImage: string | null;
  images: string[] | null;
  title: string;
}) {
  const all = [...new Set([...(mainImage ? [mainImage] : []), ...(images ?? [])])];
  const [active, setActive] = useState(0);

  if (all.length === 0) return null;

  const current = all[Math.min(active, all.length - 1)];

  /* Стрелками влево/вправо — по кадрам, не выходя за границы списка. */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActive(i => (i + 1) % all.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive(i => (i - 1 + all.length) % all.length);
    }
  };

  return (
    <div className={styles.imageGallery}>
      <div className={styles.imageMain}>
        <Image
          key={current}
          src={current}
          alt={all.length > 1 ? `${title} — фото ${active + 1} из ${all.length}` : title}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          priority
          className={styles.imageMainImg}
        />
        {all.length > 1 && (
          <span className={styles.imageCounter}>
            {active + 1} / {all.length}
          </span>
        )}
      </div>

      {all.length > 1 && (
        <div
          className={styles.imageThumbs}
          role="group"
          aria-label="Фотографии объекта"
          onKeyDown={onKeyDown}
        >
          {all.map((img, idx) => (
            <button
              key={img}
              type="button"
              className={`${styles.imageThumbWrap} ${idx === active ? styles.imageThumbWrapActive : ''}`}
              onClick={() => setActive(idx)}
              aria-label={`Показать фото ${idx + 1} из ${all.length}`}
              aria-current={idx === active}
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 220px"
                className={styles.imageThumbImg}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
