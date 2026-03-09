export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, rgba(3,8,20,0.98) 0%, rgba(4,10,24,0.98) 100%)',
        color: 'var(--text)',
      }}
    >
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {children}
      </main>
    </div>
  );
}
