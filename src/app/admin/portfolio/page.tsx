/**
 * /admin/portfolio — preview of the brochure PDF.
 *
 * Single engine: Chromium/Puppeteer. Source pages live at /portfolio/print
 * (RU) and /portfolio/print/en; scripts/build-pdf.mjs bakes them into
 * public/portfolio.pdf — the file the public Hero/services buttons download.
 * (The react-pdf "quick" engine was removed 2026-06-11.)
 */
import { buildGeoIndex } from '@/lib/geo/works';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { getProjects, getDesignProjects, getMaintenanceProjects } from '@/lib/data';
import { PortfolioClient } from './PortfolioClient';

export const dynamic = 'force-dynamic';

// Маркетинговые цифры брошюры (см. PrintBrochure: 29 СМР + 20 обслуживание + 87 ПД).
const DISPLAY = { smr: 49, pd: 87, registry: 136 };

export default async function AdminPortfolioPage() {
  const [projects, design, maintenance] = await Promise.all([
    getProjects(),
    getDesignProjects(),
    getMaintenanceProjects(),
  ]);

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
    realDesignInDb:  design.length,
    realMaintInDb:   maintenance.length,
    realCompleted:   projects.filter((p) => p.status === 'completed').length,
    realInProgress:  projects.filter((p) => p.status === 'in-progress').length,
    realPlanned:     projects.filter((p) => p.status === 'planned').length,
    realMapMarkers:  buildGeoIndex(projects, [], []).works.length,
    displaySmr:      DISPLAY.smr,
    displayPd:       DISPLAY.pd,
    displayRegistry: DISPLAY.registry,
  };

  return <PortfolioClient stats={stats} premium={premium} />;
}
