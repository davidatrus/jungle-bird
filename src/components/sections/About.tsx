export default function About() {
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'var(--surface)' }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl ring-1 ring-[var(--ring)]">
          <img
            src="/images/interior.jpg"
            alt="Lounge interior"
            className="h-full w-full object-cover sepia"
          />
        </div>
        <div>
          <h2 className="mb-4 text-3xl md:text-5xl">
            Calgary’s Vintage Rum Lounge
          </h2>
          <div className="space-y-4" style={{ color: 'var(--muted)' }}>
            <p>
              A barrel-aged ambience with a modern pour. Small plates, vinyl
              nights, and a curated rum list.
            </p>
            <p>
              Warm wood, brass accents, and remastered classics designed for
              conversation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
