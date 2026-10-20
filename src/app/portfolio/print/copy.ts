/* ─────────────────────────────────────────────────────────────────
   Copy that the brochure layout adds itself (case header labels, the
   testimonials QR card). Everything else comes from
   content/{ru,en}.tsx unchanged. Keep RU and EN in sync.
   ───────────────────────────────────────────────────────────────── */

export type LayoutCopy = {
  caseStamp: {
    scope: string;           // «СОСТАВ РАБОТ» / «SCOPE OF WORK»
  };
  testimonials: {
    siteKicker: string;      // QR card under the featured letters → /testimonials
    siteTitle: string;
  };
};

const ru: LayoutCopy = {
  caseStamp: {
    scope: 'СОСТАВ РАБОТ',
  },
  testimonials: {
    siteKicker: 'Все отзывы заказчиков',
    siteTitle: 'Остальные письма заказчиков — на сайте компании',
  },
};

const en: LayoutCopy = {
  caseStamp: {
    scope: 'SCOPE OF WORK',
  },
  testimonials: {
    siteKicker: 'All client testimonials',
    siteTitle: 'The other client letters are on our website',
  },
};

export const LAYOUT_COPY = { ru, en };
