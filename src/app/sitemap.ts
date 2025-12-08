// app/sitemap.ts
import type { MetadataRoute } from 'next';

const baseUrl = 'https://www.junglebirdtikiyyc.com';

// Static top-level pages on the site
const staticRoutes: string[] = ['/', '/menu', '/gallery', '/contact'];

// Blog slugs – one entry per /blog/[slug] page
const blogSlugs: string[] = [
  'calgary-date-night-jungle-bird',
  'best-tiki-cocktails-calgary',
  '17th-ave-nightlife-guide',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => {
    const isHome = path === '/';

    return {
      url: `${baseUrl}${isHome ? '' : path}`,
      lastModified: now,
      changeFrequency: isHome || path === '/menu' ? 'weekly' : 'monthly',
      priority: isHome
        ? 1
        : path === '/menu'
          ? 0.9
          : path === '/gallery'
            ? 0.7
            : 0.5, // contact
    };
  });

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
