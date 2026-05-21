/**
 * Single data fetch for the portfolio PDF. Reuses the website's data
 * layer (src/lib/data.ts) so that any change to the project list, design
 * registry, or map coordinates is automatically reflected in the next
 * generated PDF without manual sync.
 *
 * Marketing numbers (49 СМР, 87 ПД, 16 регионов, 2 страны, 94% повторных
 * контрактов) are tuned copy — see project memory "all-numbers-invented".
 * They live in content/ru.ts and are merged here so the engine sees one
 * data shape.
 */
import { getProjects } from '@/lib/data';
import type { Project } from '@/lib/types';

export type PortfolioData = {
  // Map data — real, from DB
  mapProjects: Pick<Project, 'id' | 'x_map' | 'y_map' | 'status'>[];

  // Status counts — real, from DB (fall back to invented copy if 0)
  completed: number;
  inProgress: number;
  planned: number;

  // Marketing numbers — invented copy, locked to match target brochure
  countSmr: number;
  countPd: number;
  countRegions: number;
  countCountries: number;
  countRegistry: number;
};

export async function getPortfolioData(): Promise<PortfolioData> {
  const projects = await getProjects();

  const mapProjects = projects
    .filter((p): p is Project & { x_map: number; y_map: number } =>
      p.x_map != null && p.y_map != null,
    )
    .slice(0, 40)
    .map((p) => ({ id: p.id, x_map: p.x_map, y_map: p.y_map, status: p.status }));

  const completed  = projects.filter((p) => p.status === 'completed').length;
  const inProgress = projects.filter((p) => p.status === 'in-progress').length;
  const planned    = projects.filter((p) => p.status === 'planned').length;

  const countSmr = 49;
  const countPd  = 87;

  return {
    mapProjects,
    completed:  completed  || 43,
    inProgress: inProgress || 3,
    planned:    planned    || 3,
    countSmr,
    countPd,
    countRegions:   16,
    countCountries: 2,
    countRegistry:  countSmr + countPd,
  };
}
