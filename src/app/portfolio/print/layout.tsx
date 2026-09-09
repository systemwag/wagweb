export const metadata = {
  title: 'WAG Portfolio · Print',
  // Print-версии дублируют контент сайта — не индексировать.
  robots: { index: false, follow: false },
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        /* SCREEN: hide global chrome (header, GlobalVerticalBg) — but keep main content visible */
        body > header,
        body > [aria-hidden="true"] { display: none !important; }
        body > div[style*="z-index"] {
          padding: 0 !important;
          z-index: auto !important;
        }

        /* PRINT: page setup + hide globals, keep content. Do NOT hide body > *. */
        @media print {
          @page { size: A4 portrait; margin: 0; }
          /* Глобальные свечения body::before (globals.css) — полупрозрачные
             радиальные градиенты: в PDF превращаются в soft mask на каждой
             странице, а превью WhatsApp/Telegram на них спотыкается. */
          body::before { display: none !important; }
          html, body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body > header,
          body > [aria-hidden="true"] { display: none !important; }
          body > div[style*="z-index"] {
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
      {children}
    </>
  );
}
