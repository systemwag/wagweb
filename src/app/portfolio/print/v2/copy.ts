/* ─────────────────────────────────────────────────────────────────
   Copy that exists only in the v2 layout (case header labels, the
   testimonials QR card). Everything else comes from
   ../content/{ru,en}.tsx unchanged. Keep RU and EN in sync.
   ───────────────────────────────────────────────────────────────── */

export type V2Copy = {
  caseStamp: {
    scope: string;           // «СОСТАВ РАБОТ» — was hard-coded Russian in v1, also in EN
  };
  testimonials: {
    siteKicker: string;      // QR card under the three letters → /testimonials
    siteTitle: string;
  };
};

const ru: V2Copy = {
  caseStamp: {
    scope: 'СОСТАВ РАБОТ',
  },
  testimonials: {
    siteKicker: 'Все отзывы заказчиков',
    siteTitle: 'Остальные письма заказчиков — на сайте компании',
  },
};

const en: V2Copy = {
  caseStamp: {
    scope: 'SCOPE OF WORK',
  },
  testimonials: {
    siteKicker: 'All client testimonials',
    siteTitle: 'The other client letters are on our website',
  },
};

export const V2_COPY = { ru, en };
