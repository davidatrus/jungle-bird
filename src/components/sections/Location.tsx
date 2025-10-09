export default function Location() {
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: 'var(--surface)' }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="section-title mb-6 text-3xl md:text-4xl">Find Us</h3>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl ring-1 ring-[var(--line)]">
            <iframe
              title="Map"
              src="https://www.google.com/maps?q=Calgary,AB&output=embed"
              className="h-72 w-full md:h-full"
              loading="lazy"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-lg" style={{ color: 'var(--text)' }}>
                Address
              </h4>
              <p style={{ color: 'var(--muted)' }}>
                123 Example St SW, Calgary AB
              </p>
            </div>
            <div>
              <h4 className="text-lg" style={{ color: 'var(--text)' }}>
                Contact
              </h4>
              <p style={{ color: 'var(--muted)' }}>
                (825) 000 0000 • hello@junglebird.example
              </p>
            </div>
            <div>
              <h4 className="text-lg" style={{ color: 'var(--text)' }}>
                Hours
              </h4>
              <p style={{ color: 'var(--muted)' }}>
                Sun–Thu: 5:00pm–1:00am
                <br />
                Fri–Sat: 5:00pm–2:00am
                <br />
                Mon: Closed
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
