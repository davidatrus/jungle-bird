export default function BlogLayout({
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
          'linear-gradient(180deg, rgba(9,8,7,.985) 0%, rgba(14,10,8,.98) 55%, rgba(9,8,7,.99) 100%)',
        color: 'var(--text)',
      }}
    >
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {children}
      </main>
    </div>
  );
}
