/**
 * /admin/portfolio — two-engine PDF preview.
 *
 * Tab 1 — Premium (Chromium): reads /portfolio.pdf, baked on demand by
 *   /api/admin/rebuild-portfolio → scripts/build-pdf.mjs → CSS-rich PDF.
 *   This is what the public Hero button points to.
 *
 * Tab 2 — Quick (react-pdf): reads /api/portfolio.pdf, generated live
 *   from the same data layer in ~2 sec. Use for fast sanity checks after
 *   editing project data.
 */
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { getProjects } from '@/lib/data';
import { getPortfolioData } from '@/lib/pdf/data/getPortfolioData';
import { ru } from '@/lib/pdf/content/ru';
import { PortfolioClient } from './PortfolioClient';

export const dynamic = 'force-dynamic';

export default async function AdminPortfolioPage() {
  const data     = await getPortfolioData();
  const projects = await getProjects();

  const pdfPath = path.join(process.cwd(), 'public', 'portfolio.pdf');
  const premium = existsSync(pdfPath)
    ? {
        exists:    true,
        sizeBytes: statSync(pdfPath).size,
        mtime:     statSync(pdfPath).mtime.toISOString(),
      }
    : { exists: false, sizeBytes: 0, mtime: null as string | null };

  const stats = {
    realSmrInDb:     projects.length,
    realCompleted:   data.completed,
    realInProgress:  data.inProgress,
    realPlanned:     data.planned,
    realMapMarkers:  data.mapProjects.length,
    displaySmr:      data.countSmr,
    displayPd:       data.countPd,
    displayRegistry: data.countRegistry,
    testimonials:    ru.testimonials.items.length,
    partners:        ru.partners.items.length,
  };

  return <PortfolioClient stats={stats} premium={premium} />;
}
