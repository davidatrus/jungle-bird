import Image from 'next/image';
import Link from 'next/link';
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

// optional SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return {
    title: `${p.title} • Jungle Bird`,
    description: p.excerpt ?? 'Article from Jungle Bird',
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
        {paras.map((t, i) => (
          <p key={i} style={{ color: 'var(--text)' }}>
            {t}
          </p>
        ))}
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
