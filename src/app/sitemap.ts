import type { MetadataRoute } from 'next';
import { getProjectSlugs, getMaintenanceSlugs } from '@/lib/data';

const BASE_URL = 'https://west-arlan.kz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectSlugs, maintenanceSlugs] = await Promise.all([
    getProjectSlugs(),
    getMaintenanceSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE_URL}/about`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/services`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/projects`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/maintenance`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/contacts`,    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.7 },
  ];

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

  return [...staticRoutes, ...projectRoutes, ...maintenanceRoutes];
}
