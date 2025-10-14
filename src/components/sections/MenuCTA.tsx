export default function MenuCTA() {
  return (
    <section
      className="relative py-20 text-center md:py-28"
      style={{
        // Slightly stronger gradient so text always reads, image still visible
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.50), rgba(0,0,0,0.72)), url('/images/misc/menu-bg.jpg') center/cover no-repeat",
      }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <h3
          className="section-title mb-3 text-3xl md:text-4xl"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.55)' }}
        >
          Our Menu
        </h3>

        <p
          className="mb-6 md:text-lg"
          style={{
            color: 'var(--muted)',
            textShadow: '0 1px 8px rgba(0,0,0,0.55)',
          }}
        >
          Classic & remastered cocktails, exquisite eats, and beyond.
        </p>

        <a
          href="/menu"
          className="btn-pop btn-shadow inline-block rounded-full border px-6 py-3 text-sm"
          style={{ background: 'var(--cta)', color: '#1B1612' }}
        >
          View Menu
        </a>
      </div>
    </section>
  );
}
