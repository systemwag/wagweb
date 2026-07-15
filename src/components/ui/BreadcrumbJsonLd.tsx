import { SITE_URL } from '@/lib/site';

interface Crumb {
  name: string;
  /** Path from site root, e.g. '/projects'. Omit for the current (last) page. */
  path?: string;
}

/**
 * schema.org BreadcrumbList — renders the JSON-LD script tag only,
 * the visible breadcrumb nav stays in each page's own markup.
 */
export default function BreadcrumbJsonLd({ crumbs }: { crumbs: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.path ? { item: `${SITE_URL}${crumb.path}` } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
