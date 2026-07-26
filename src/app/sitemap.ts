import type { MetadataRoute } from 'next';
import { getProjectSlugs, getMaintenanceSlugs, getDesignProjects } from '@/lib/data';
import { SITE_URL as BASE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectSlugs, maintenanceSlugs, designProjects] = await Promise.all([
    getProjectSlugs(),
    getMaintenanceSlugs(),
    getDesignProjects(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE_URL}/about`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/services`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/projects`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/maintenance`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/design`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/licenses`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.6 },
    { url: `${BASE_URL}/zakazchikam`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${BASE_URL}/kz`,           lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${BASE_URL}/testimonials`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contacts`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.7 },
    { url: `${BASE_URL}/privacy`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/terms`,        lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];
  /* Сознательно НЕ в карте: /effects, /portfolio/print* и /construction-3d* —
     полигоны и печатные страницы, закрыты в robots.ts и через noindex. */

  const projectRoutes: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url:             `${BASE_URL}/projects/${slug}`,
    lastModified:    new Date(),
    changeFrequency: 'monthly',
    priority:        0.7,
  }));

  const maintenanceRoutes: MetadataRoute.Sitemap = maintenanceSlugs.map((slug) => ({
    url:             `${BASE_URL}/maintenance/${slug}`,
    lastModified:    new Date(),
    changeFrequency: 'monthly',
    priority:        0.6,
  }));

  // Страница /design/[id] резолвит по числовому id (см. DesignTable → /design/${p.id});
  // slug в URL не участвует.
  const designRoutes: MetadataRoute.Sitemap = designProjects.map((d) => ({
    url:             `${BASE_URL}/design/${d.id}`,
    lastModified:    new Date(),
    changeFrequency: 'monthly',
    priority:        0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...maintenanceRoutes, ...designRoutes];
}
