import Image from 'next/image';
import { urlFor } from '@/sanity/image';

type SanityImage =
  | string
  | { _ref?: string }
  | { asset?: { _ref?: string; _id?: string } };

type Item = { caption?: string; image: SanityImage };

export default function GalleryGrid({
  items,
  imgClass = 'h-64',
  showCaptions = false, // when true, show hover caption overlay on this page
}: {
  items: Item[];
  imgClass?: string;
  showCaptions?: boolean;
}) {
  if (!items?.length) {
    return <p className="text-center opacity-80">Gallery coming soon.</p>;
  }

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((g, i) => {
        const src = urlFor(g.image).width(1600).height(1200).fit('crop').url();
        const alt = g.caption?.trim() || `Gallery image ${i + 1}`;

        return (
          <figure
            key={i}
            className="group brass-border relative overflow-hidden rounded-2xl ring-1 ring-[var(--line)]"
          >
            {/* Image */}
            <Image
              src={src}
              alt={alt}
              width={1600}
              height={1200}
              className={`${imgClass} w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]`}
              priority={i < 3}
              // no B/W; keep things warm/neutral
              style={{ filter: 'sepia(0) saturate(1) brightness(1)' }}
            />

            {/* Warm gradient overlay on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(60% 60% at 50% 40%, rgba(255,153,102,.16) 0%, rgba(0,0,0,0) 70%), linear-gradient(180deg, rgba(0,0,0,0) 65%, rgba(0,0,0,.20) 100%)',
              }}
            />

            {/* Caption on hover (only if showCaptions=true) */}
            {showCaptions && g.caption?.trim() ? (
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 px-3 pb-3 text-center text-sm opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="rounded-full bg-[rgba(27,22,18,.55)] px-3 py-1 ring-1 ring-[var(--line)]">
                  {g.caption}
                </span>
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </section>
  );
}
