import type { MetadataRoute } from 'next';
import { client } from '@/sanity/client';

const baseUrl = 'https://www.junglebirdtikiyyc.com';

const staticRoutes: string[] = ['/', '/menu', '/gallery', '/contact'];

const prohibitionRoutes: string[] = [
  '/prohibition',
  '/prohibition/menu',
  '/prohibition/gallery',
  '/prohibition/events',
  '/prohibition/contact',
];

const blogSlugs: string[] = [
  'calgary-date-night-jungle-bird',
  'best-tiki-cocktails-calgary',
  '17th-ave-nightlife-guide',
];

const prohibitionBlogSlugs: string[] = [
  'roaring-twenties-party-era',
  'step-into-the-past-grand-opening-of-downtown-calgarys-most-exclusive-underground-lounge',
  'prohibition-era-cocktail',
];

const qEventSlugsByVenue = /* groq */ `
*[_type == "event" && venueKey == $venueKey && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt
}
`;

type EventSlugRow = {
  slug: string;
  _updatedAt?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [jbEvents, prohibitionEvents] = await Promise.all([
    client
      .fetch<EventSlugRow[]>(qEventSlugsByVenue, { venueKey: 'jungle_bird' })
      .catch(() => []),
    client
      .fetch<EventSlugRow[]>(qEventSlugsByVenue, { venueKey: 'prohibition' })
      .catch(() => []),
  ]);

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
            : 0.5,
    };
  });

  const prohibitionEntries: MetadataRoute.Sitemap = prohibitionRoutes.map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency:
        path === '/prohibition' || path === '/prohibition/menu'
          ? 'weekly'
          : 'monthly',
      priority:
        path === '/prohibition'
          ? 0.95
          : path === '/prohibition/menu'
            ? 0.85
            : path === '/prohibition/gallery'
              ? 0.7
              : 0.6,
    }),
  );

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const prohibitionBlogEntries: MetadataRoute.Sitemap =
    prohibitionBlogSlugs.map((slug) => ({
      url: `${baseUrl}/prohibition/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  const jungleBirdEventEntries: MetadataRoute.Sitemap = jbEvents.map(
    (event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: event._updatedAt ? new Date(event._updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  );

  const prohibitionEventEntries: MetadataRoute.Sitemap = prohibitionEvents.map(
    (event) => ({
      url: `${baseUrl}/prohibition/events/${event.slug}`,
      lastModified: event._updatedAt ? new Date(event._updatedAt) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  );

  return [
    ...staticEntries,
    ...prohibitionEntries,
    ...blogEntries,
    ...prohibitionBlogEntries,
    ...jungleBirdEventEntries,
    ...prohibitionEventEntries,
  ];
}
