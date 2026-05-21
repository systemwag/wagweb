/**
 * Helper: assemble all inputs, render to a PDF buffer.
 * Used by both the API route and the offline build script.
 */
import React from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { Portfolio } from './Portfolio';
import { ru } from './content/ru';
import { getPortfolioData } from './data/getPortfolioData';

export async function generatePortfolioPdf(): Promise<Buffer> {
  const data = await getPortfolioData();

  // Pre-render QR codes as PNG buffers. We do this here (not inside the
  // block) because react-pdf prefers concrete buffers over data URLs and
  // it keeps the block component pure-sync.
  const [qrSmr, qrPd] = await Promise.all([
    QRCode.toBuffer('https://arlan-gr.kz/projects', {
      type: 'png',
      errorCorrectionLevel: 'H',
      margin: 0,
      width: 256,
      color: { dark: '#1A1A1A', light: '#F8EFE0' },
    }),
    QRCode.toBuffer('https://arlan-gr.kz/design', {
      type: 'png',
      errorCorrectionLevel: 'H',
      margin: 0,
      width: 256,
      color: { dark: '#1A1A1A', light: '#F8EFE0' },
    }),
  ]);

  return await renderToBuffer(
    React.createElement(Portfolio, { content: ru, data, qrBuffers: [qrSmr, qrPd] }) as React.ReactElement<DocumentProps>,
  );
}
