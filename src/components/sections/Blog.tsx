import Link from 'next/link';
import Image from 'next/image';
import { posts } from '@/data/posts';
import type { VenueKey } from '@/data/posts';

export default function Blog({ venueKey }: { venueKey: VenueKey }) {
  const venuePosts = posts.filter((p) => p.venueKey === venueKey);
  if (!venuePosts.length) return null;

  const isProhibition = venueKey === 'prohibition';

  return (
    <section className="py-16 md:py-24" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-4">
        <h3
          className={`section-title mb-8 text-center ${
            isProhibition ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
          }`}
        >
          Blog Posts
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {venuePosts.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className="overflow-hidden rounded-2xl ring-1 ring-[var(--line)] transition hover:scale-[1.01] hover:bg-white/[0.02]"
            >
              <div className="relative h-52 w-full">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="space-y-3 p-4">
                <h4
                  className={`leading-snug ${
                    isProhibition ? 'section-title text-2xl' : 'text-lg'
                  }`}
                  style={{ color: 'var(--text)' }}
                >
                  {p.title}
                </h4>

                <p
                  className={isProhibition ? 'text-base leading-7' : 'text-sm'}
                  style={{ color: 'var(--muted)' }}
                >
                  {p.excerpt}
                </p>

                <span
                  className="text-xs tracking-[0.16em] uppercase"
                  style={{ color: 'var(--muted)' }}
                >
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
