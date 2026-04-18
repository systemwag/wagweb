'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  file: string;
  title: string;
}

export default function PdfPreview({ file, title }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          position: 'relative',
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Document
          file={file}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={
            <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>
              Загрузка...
            </div>
          }
          error={
            <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>
              Не удалось загрузить PDF
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            width={320}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>

        {numPages > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              style={{
                position: 'absolute',
                left: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                cursor: currentPage <= 1 ? 'default' : 'pointer',
                opacity: currentPage <= 1 ? 0.3 : 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
              aria-label="Предыдущая страница"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                cursor: currentPage >= numPages ? 'default' : 'pointer',
                opacity: currentPage >= numPages ? 0.3 : 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
              aria-label="Следующая страница"
            >
              ›
            </button>
          </>
        )}
      </div>

      {numPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {Array.from({ length: numPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: 'none',
                background: currentPage === i + 1 ? 'var(--gold)' : 'var(--text-muted)',
                opacity: currentPage === i + 1 ? 1 : 0.4,
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s',
              }}
              aria-label={`Страница ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
