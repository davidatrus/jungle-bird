export default function MenuCTA() {
  return (
    <section
      className="py-20 text-center"
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url('/images/menu-bg.jpg') center/cover no-repeat",
      }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <h3 className="section-title mb-3 text-3xl md:text-4xl">Our Menu</h3>
        <p className="mb-6" style={{ color: 'var(--muted)' }}>
          Classic & remastered cocktails, exquisite eats, and beyond.
        </p>
        <a
          href="/menu"
          className="inline-block rounded-full border px-6 py-3 text-sm"
          style={{ background: 'var(--cta)', color: '#1B1612' }}
        >
          View Menu
        </a>
      </div>
    </section>
  );
}
