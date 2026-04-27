export const metadata = {
  title: 'WAG Portfolio · Print',
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
