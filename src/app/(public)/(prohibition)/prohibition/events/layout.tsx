export default function ProhibitionEventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-venue="prohibition"
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, rgba(3,8,20,.985) 0%, rgba(5,12,28,.99) 55%, rgba(3,8,20,.99) 100%)',
        color: 'var(--text)',
      }}
    >
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {children}
      </main>
    </div>
  );
}
