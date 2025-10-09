import { posts } from '@/data/posts';

export default function Blog() {
  return (
    <section className="py-16 md:py-24" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="section-title mb-8 text-center text-3xl md:text-4xl">
          Blog Posts
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <a
              key={p.id}
              href={p.href}
              className="overflow-hidden rounded-2xl ring-1 ring-[var(--line)] transition hover:scale-[1.01]"
            >
              <img src={p.image} alt="" className="h-44 w-full object-cover" />
              <div className="space-y-2 p-4">
                <h4 className="text-lg" style={{ color: 'var(--text)' }}>
                  {p.title}
                </h4>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {p.excerpt}
                </p>
                <span
                  className="text-xs uppercase"
                  style={{ color: 'var(--muted)' }}
                >
                  Read more →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
