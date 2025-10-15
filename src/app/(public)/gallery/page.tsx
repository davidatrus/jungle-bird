import { client } from '@/sanity/client';
import { qGallery } from '@/sanity/queries';
import GalleryGrid from '@/components/gallery/GalleryGrid';

export const revalidate = 60;

export default async function GalleryPage() {
  const items = await client.fetch(qGallery).catch(() => []);

  return (
    <>
      <header className="mb-8 text-center md:mb-10">
        <h1 className="font-display text-3xl md:text-4xl">GALLERY</h1>
        <p className="mt-2 opacity-80">
          A glimpse of the room, plates, and pours.
        </p>
      </header>

      {/* Turn on captions for this page only */}
      <GalleryGrid items={items} imgClass="h-64 md:h-72" showCaptions />
    </>
  );
}
