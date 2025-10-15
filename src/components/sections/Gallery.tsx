// src/components/sections/Gallery.tsx
import { client } from '@/sanity/client';
import { qGallery } from '@/sanity/queries';
import GalleryCarouselClient from '@/components/gallery/GalleryCarousel.client';

export const revalidate = 60;

export default async function HomeGallerySection() {
  const items = await client.fetch(qGallery).catch(() => []);

  // OPTIONAL: cap the number shown on homepage for perf/UX
  // const items = (allItems || []).slice(0, 18);

  if (!items?.length) return null;

  return (
    <section className="mx-auto mt-12 max-w-6xl px-4">
      <h2 className="font-display mb-6 text-center text-3xl md:text-4xl">
        GALLERY
      </h2>
      <GalleryCarouselClient items={items} />
    </section>
  );
}
