export default function About() {
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'var(--surface)' }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl ring-1 ring-[var(--ring)]">
          <img
            src="/images/misc/interior.jpg"
            alt="Warm, ember-lit lounge interior"
            className="h-full w-full object-cover sepia"
          />
        </div>

        {/* Copy */}
        <div>
          <h2 className="mb-4 text-3xl md:text-5xl">
            Calgary’s Hottest TIKI-CAVE Lounge
          </h2>

          <div className="space-y-4" style={{ color: 'var(--muted)' }}>
            <p>
              Descend beneath 17th Ave into a fire-lit hideaway of rum, smoke,
              and jungle rhythms. Our cave glows warm and welcome. Where craft
              tiki meets sultry basement lounge.
            </p>

            <p>
              Think basalt and bamboo, torches and tropicals. A cavernous lounge
              where heat and haze meet bright citrus and island spice. Settle
              into the warmth; the night slows down here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
