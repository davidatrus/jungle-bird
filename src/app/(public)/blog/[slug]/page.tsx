import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { posts } from '@/data/posts';

// simple helpers
const getPost = (slug: string) => posts.find((p) => p.slug === slug);
const getSiblings = (slug: string) => {
  const i = posts.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? posts[i - 1] : null,
    next: i < posts.length - 1 ? posts[i + 1] : null,
  };
};
// very small helper: turn **text** into <strong>text</strong>
const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    const match = part.match(/^\*\*(.+)\*\*$/);
    if (match) {
      return <strong key={idx}>{match[1]}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
};

// SEO + social previews per blog post
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

  // If the slug doesn't match any post, still return sensible metadata
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

  // If your posts don't yet have “content”, we render tasteful filler.
  const paras: string[] = post.content ?? [
    'The 1920s, often called the Roaring Twenties, were a decade of contrast—euphoria and excess, elegance and edge. In that spirit, we raise a glass to stories worth sipping.',
    'Speakeasies, swing, and shimmering art deco set the tone. Bartenders chased balance and bite, balancing bright citrus with dusky amaro, velvet foam with crystalline ice.',
    'Tonight we revisit a classic, reimagined for modern palates—stirred with restraint, garnished with a wink.',
  ];

  return (
    <article className="prose prose-invert max-w-none">
      {/* Title */}
      <h1 className="font-display !text-3xl !leading-tight md:!text-4xl">
        {post.title}
      </h1>

      {/* Hero */}
      {post.image && (
        <div className="my-6 md:my-8">
          <Image
            src={post.image}
            alt={post.title}
            width={1600}
            height={900}
            className="brass-border w-full rounded-xl border"
            priority
          />
        </div>
      )}

      {/* Body */}
      <section className="not-prose font-ui space-y-5 text-[15px] leading-7 md:text-[16px] md:leading-8">
        {paras.map((t, i) => {
          const trimmed = t.trim();

          // Lines like "1. Nutty Tourist"
          const isNumberedHeading = /^[0-9]+\.\s/.test(trimmed);

          // Lines like "(Signature Cave Cocktails – Page 2)"
          const isMetaLine = /^\(.+\)$/.test(trimmed);

          // Generic short, punctuation-free headings
          const isSimpleHeading =
            trimmed.length < 80 && !/[.?!]/.test(trimmed) && !isMetaLine;

          // BLOG 1 CTA line – bold the second half only
          const ctaPrefix = 'Ready to see it for yourself? ';
          if (trimmed.startsWith(ctaPrefix)) {
            const rest = trimmed.slice(ctaPrefix.length);
            return (
              <p key={i} style={{ color: 'var(--text)' }}>
                {ctaPrefix}
                <strong>{rest}</strong>
              </p>
            );
          }

          // Main headings (drink names, closing title, etc.)
          if (isNumberedHeading || isSimpleHeading) {
            return (
              <h2
                key={i}
                className="font-display mt-6 text-xl font-semibold md:text-2xl"
                style={{ color: 'var(--text)' }}
              >
                {renderInline(trimmed)}
              </h2>
            );
          }

          // Meta line under each drink name – smaller + italic
          if (isMetaLine) {
            const inner = trimmed.replace(/^\(|\)$/g, '');
            return (
              <p
                key={i}
                className="text-sm italic opacity-75"
                style={{ color: 'var(--text)' }}
              >
                {renderInline(inner)}
              </p>
            );
          }

          // Default paragraph
          return (
            <p key={i} style={{ color: 'var(--text)' }}>
              {renderInline(trimmed)}
            </p>
          );
        })}
      </section>

      {/* Prev / Next */}
      <nav className="not-prose mt-12 flex items-center justify-between gap-4 md:mt-16">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="group brass-border inline-flex items-center gap-2 rounded-full px-3 py-2"
            style={{ color: 'var(--text)' }}
            aria-label={`Previous: ${prev.title}`}
          >
            <span aria-hidden>‹</span>
            <span className="opacity-80 transition group-hover:opacity-100">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group brass-border inline-flex items-center gap-2 rounded-full px-3 py-2"
            style={{ color: 'var(--text)' }}
            aria-label={`Next: ${next.title}`}
          >
            <span className="opacity-80 transition group-hover:opacity-100">
              {next.title}
            </span>
            <span aria-hidden>›</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
