import Image from 'next/image';

const items = [
  '/images/gallery/gallery-1.jpg',
  '/images/gallery/gallery-2.jpg',
  '/images/gallery/gallery-3.jpg',
  '/images/gallery/gallery-4.jpg',
  '/images/gallery/gallery-5.jpg',
  '/images/gallery/gallery-6.jpg',
  '/images/gallery/gallery-7.jpg',
  '/images/gallery/gallery-8.jpg',
];

export default function GalleryPage() {
  return (
    <>
      <header className="mb-8 text-center md:mb-10">
        <h1 className="font-display text-3xl md:text-4xl">GALLERY</h1>
        <p className="mt-2 opacity-80">
          A glimpse of the room, plates, and pours.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        {items.map((src, i) => (
          <figure
            key={i}
            className="group brass-border overflow-hidden rounded-2xl border"
          >
            <Image
              src={src}
              alt=""
              width={1200}
              height={900}
              className="h-64 w-full object-cover transition duration-200 group-hover:scale-[1.02] group-hover:sepia"
              priority={i < 3}
            />
          </figure>
        ))}
      </section>
    </>
  );
}
