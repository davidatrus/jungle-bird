import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { posts, type Post, type VenueKey } from '@/data/posts';

const VENUE_KEY: VenueKey = 'jungle_bird';

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

  const isNumberedHeading = /^[0-9]+\.\s/.test(trimmed);
  const isMetaLine = /^\(.+\)$/.test(trimmed);
  const isBullet = /^•\s/.test(trimmed);
  const isSimpleHeading =
    trimmed.length < 80 && !/[.?!]/.test(trimmed) && !isMetaLine && !isBullet;

  const ctaPrefix = 'Ready to see it for yourself? ';
  if (trimmed.startsWith(ctaPrefix)) {
    const rest = trimmed.slice(ctaPrefix.length);
    return (
      <p key={i} className="text-[var(--text)]">
        {ctaPrefix}
        <strong>{rest}</strong>
      </p>
    );
  }

  if (isNumberedHeading || isSimpleHeading) {
    return (
      <h2 key={i} className="section-title mt-8 text-2xl md:text-3xl">
        {renderInline(trimmed)}
      </h2>
    );
  }

  if (isMetaLine) {
    const inner = trimmed.replace(/^\(|\)$/g, '');
    return (
      <p
        key={i}
        className="text-sm italic opacity-75"
        style={{ color: 'var(--muted)' }}
      >
        {renderInline(inner)}
      </p>
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);

  const fallbackTitle = 'Jungle Bird Blog | Jungle Bird Tiki Lounge Calgary';
  const fallbackDescription =
    "Stories from Jungle Bird, Calgary's tiki-cave lounge on 17th Ave.";

  if (!p) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        type: 'article',
        url: `https://www.junglebirdtikiyyc.com/blog/${slug}`,
        title: fallbackTitle,
        description: fallbackDescription,
        images: [
          {
            url: '/images/og/jungle-bird-og.webp',
            width: 1200,
            height: 630,
            alt: 'Jungle Bird Tiki Lounge YYC — cocktails & rum on 17th Ave in Calgary',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: fallbackTitle,
        description: fallbackDescription,
        images: ['/images/og/jungle-bird-og.webp'],
      },
    };
  }

  const canonicalUrl = `https://www.junglebirdtikiyyc.com/blog/${p.slug}`;
  const title = `${p.title} • Jungle Bird`;
  const description =
    p.excerpt ??
    "Discover Jungle Bird, Calgary's tiki-cave lounge on 17th Ave.";
  const ogImageUrl = p.image ?? '/images/og/jungle-bird-og.webp';

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
          alt: p.title,
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

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-3xl">Article not found</h1>
        <p className="mt-4 opacity-80">
          The post you’re looking for doesn’t exist.
        </p>
        <Link className="mt-6 inline-block underline" href="/#blog">
          Back to Blog
        </Link>
      </div>
    );
  }

  const { prev, next } = getSiblings(post.slug);

  const paras: string[] = post.content ?? [
    'The 1920s, often called the Roaring Twenties, were a decade of contrast—euphoria and excess, elegance and edge. In that spirit, we raise a glass to stories worth sipping.',
    'Speakeasies, swing, and shimmering art deco set the tone. Bartenders chased balance and bite, balancing bright citrus with dusky amaro, velvet foam with crystalline ice.',
    'Tonight we revisit a classic, reimagined for modern palates—stirred with restraint, garnished with a wink.',
  ];

  const bulletLines = paras.filter((line) => /^•\s/.test(line.trim()));
  const normalLines = paras.filter((line) => !/^•\s/.test(line.trim()));

  return (
    <article className="max-w-none">
      <h1 className="section-title text-4xl leading-tight md:text-5xl">
        {post.title}
      </h1>

      {post.image && (
        <div className="my-6 md:my-8">
          <Image
            src={post.image}
            alt={post.title}
            width={1600}
            height={900}
            className="brass-border w-full rounded-2xl border"
            priority
          />
        </div>
      )}

      <section className="font-ui space-y-5 text-[16px] leading-8 md:text-[17px] md:leading-9">
        {normalLines.map((t, i) => renderContentLine(t, i))}

        {bulletLines.length > 0 && (
          <ul className="space-y-3 pl-2">
            {bulletLines.map((t, i) => renderContentLine(t, 1000 + i))}
          </ul>
        )}
      </section>

      <nav className="mt-12 grid gap-4 border-t pt-8 md:mt-16 md:grid-cols-2">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="brass-border rounded-2xl border p-4 transition hover:bg-white/5"
            aria-label={`Previous: ${prev.title}`}
          >
            <div className="mb-2 text-xs tracking-[0.18em] uppercase opacity-70">
              Previous Article
            </div>
            <div className="section-title text-xl leading-snug">
              {prev.title}
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="brass-border rounded-2xl border p-4 text-left transition hover:bg-white/5 md:ml-auto"
            aria-label={`Next: ${next.title}`}
          >
            <div className="mb-2 text-xs tracking-[0.18em] uppercase opacity-70">
              Next Article
            </div>
            <div className="section-title text-xl leading-snug">
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
