export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, rgba(27,22,18,.96) 0%, rgba(27,22,18,.96) 100%)',
        color: 'var(--text)',
      }}
    >
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {children}
      </main>
    </div>
  );
}
