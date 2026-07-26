import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* /construction-3d покрывает и /construction-3d-claude — правило
         работает по префиксу. Обе страницы — визуальные полигоны, а не
         часть сайта; у каждой дополнительно стоит noindex в метаданных. */
      disallow: [
        '/admin',
        '/api',
        '/effects',
        '/portfolio/print',
        '/construction-3d',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
