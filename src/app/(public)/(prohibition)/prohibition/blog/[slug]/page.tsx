import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { posts, type VenueKey } from '@/data/posts';

type Params = { slug: string };

const VENUE_KEY: VenueKey = 'prohibition';

const venuePosts = posts.filter((p) => p.venueKey === VENUE_KEY);

const getPost = (slug: string) => venuePosts.find((p) => p.slug === slug);

const getSiblings = (slug: string) => {
  const i = venuePosts.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? venuePosts[i - 1] : null,
    next: i < venuePosts.length - 1 ? venuePosts[i + 1] : null,
  };
};

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, idx) => {
    const strongMatch = part.match(/^\*\*(.+)\*\*$/);
    if (strongMatch) {
      return <strong key={idx}>{strongMatch[1]}</strong>;
    }

    const emMatch = part.match(/^\*(.+)\*$/);
    if (emMatch) {
      return <em key={idx}>{emMatch[1]}</em>;
    }

    return <span key={idx}>{part}</span>;
  });
}

function renderContentLine(line: string, i: number) {
  const trimmed = line.trim();

  const isBullet = /^•\s/.test(trimmed);
  const isSimpleHeading =
    trimmed.length < 80 && !/[.?!]/.test(trimmed) && !isBullet;

  if (isSimpleHeading) {
    return (
      <h2 key={i} className="section-title mt-8 text-2xl md:text-3xl">
        {renderInline(trimmed)}
      </h2>
    );
  }

  if (isBullet) {
    const inner = trimmed.replace(/^•\s/, '');
    return (
      <li key={i} className="ml-5 list-disc" style={{ color: 'var(--text)' }}>
        {renderInline(inner)}
      </li>
    );
  }

  return (
    <p key={i} className="text-[var(--text)]">
      {renderInline(trimmed)}
    </p>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  const fallbackTitle = 'Prohibition Blog | Prohibition Lounge Calgary';
  const fallbackDescription =
    'Stories, cocktails, and speakeasy culture from Prohibition Lounge in Calgary.';
  const fallbackOg = '/images/og/prohibition-og.webp';

  if (!post) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        type: 'article',
        url: `https://www.junglebirdtikiyyc.com/prohibition/blog/${slug}`,
        title: fallbackTitle,
        description: fallbackDescription,
        images: [
          {
            url: fallbackOg,
            width: 1200,
            height: 630,
            alt: 'Prohibition Lounge Calgary',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: fallbackTitle,
        description: fallbackDescription,
        images: [fallbackOg],
      },
    };
  }

  const canonicalUrl = `https://www.junglebirdtikiyyc.com/prohibition/blog/${post.slug}`;
  const title = `${post.title} | Prohibition Lounge Calgary`;
  const description =
    post.excerpt ??
    'Stories, cocktails, and speakeasy culture from Prohibition Lounge in Calgary.';
  const ogImageUrl = post.image ?? fallbackOg;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ProhibitionBlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const post = getPost(slug);

  if (!post) return notFound();

  const { prev, next } = getSiblings(post.slug);

  const lines = post.content ?? [];
  const bulletLines = lines.filter((line) => /^•\s/.test(line.trim()));
  const normalLines = lines.filter((line) => !/^•\s/.test(line.trim()));

  return (
    <article className="max-w-none">
      <header className="mb-8 space-y-4 md:mb-10">
        <p
          className="text-xs tracking-[0.22em] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          Prohibition Journal
        </p>

        <h1 className="section-title text-4xl leading-tight md:text-6xl">
          {post.title}
        </h1>

        <p
          className="max-w-3xl text-lg leading-8"
          style={{ color: 'var(--muted)' }}
        >
          {post.excerpt}
        </p>
      </header>

      {post.image && (
        <div className="mb-8 md:mb-10">
          <Image
            src={post.image}
            alt={post.title}
            width={1600}
            height={900}
            className="w-full rounded-[28px] border border-[var(--line)] object-cover"
            priority
          />
        </div>
      )}

      <section className="space-y-5 text-[17px] leading-9 md:text-[18px]">
        {normalLines.map((line, i) => renderContentLine(line, i))}

        {bulletLines.length > 0 && (
          <ul className="space-y-3 pl-2">
            {bulletLines.map((line, i) => renderContentLine(line, 1000 + i))}
          </ul>
        )}
      </section>

      <nav className="mt-12 grid gap-4 border-t border-[var(--line)]/40 pt-8 md:mt-16 md:grid-cols-2">
        {prev ? (
          <Link
            href={`/prohibition/blog/${prev.slug}`}
            className="rounded-[24px] border border-[var(--line)] p-5 transition hover:bg-white/[0.03]"
            aria-label={`Previous article: ${prev.title}`}
          >
            <div
              className="mb-2 text-xs tracking-[0.18em] uppercase"
              style={{ color: 'var(--muted)' }}
            >
              Previous Article
            </div>
            <div className="section-title text-2xl leading-snug">
              {prev.title}
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/prohibition/blog/${next.slug}`}
            className="rounded-[24px] border border-[var(--line)] p-5 transition hover:bg-white/[0.03] md:ml-auto"
            aria-label={`Next article: ${next.title}`}
          >
            <div
              className="mb-2 text-xs tracking-[0.18em] uppercase"
              style={{ color: 'var(--muted)' }}
            >
              Next Article
            </div>
            <div className="section-title text-2xl leading-snug">
              {next.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}
