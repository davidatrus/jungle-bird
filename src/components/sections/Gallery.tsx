// src/components/sections/Gallery.tsx
import { client } from '@/sanity/client';
import { qGallery } from '@/sanity/queries';
import GalleryCarouselClient from '@/components/gallery/GalleryCarousel.client';

type Props = {
  venueKey: 'jungle_bird' | 'prohibition';
};

export default async function HomeGallerySection({ venueKey }: Props) {
  const items =
    (await client
      .fetch(
        qGallery,
        { venueKey },
        { next: { revalidate: 60, tags: ['gallery'] } },
      )
      .catch(() => [])) || [];

  if (!items.length) return null;

  const isProhibition = venueKey === 'prohibition';

  if (isProhibition) {
    return (
      <section
        className="py-16 md:py-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(3,8,20,0.985) 0%, rgba(4,10,24,0.99) 100%)',
          borderTop: '1px solid rgba(214,178,84,0.18)',
          borderBottom: '1px solid rgba(214,178,84,0.12)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display mb-6 text-center text-3xl md:text-4xl">
            GALLERY
          </h2>
          <GalleryCarouselClient items={items} venueKey={venueKey} />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-12 max-w-6xl px-4">
      <h2 className="font-display mb-6 text-center text-3xl md:text-4xl">
        GALLERY
      </h2>
      <GalleryCarouselClient items={items} venueKey={venueKey} />
    </section>
  );
}
