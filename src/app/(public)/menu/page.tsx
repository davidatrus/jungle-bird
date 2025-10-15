import { client } from '@/sanity/client';
import { qMenu } from '@/sanity/queries';

const LOCAL_FALLBACK_PDF = '/images/menu/menu.pdf';

export const revalidate = 60; // 0 in dev if you want

export default async function MenuPage() {
  const data = await client.fetch(qMenu).catch(() => null);
  const pdfUrl: string = data?.menuPdf?.asset?.url || LOCAL_FALLBACK_PDF;
  const version: string | undefined = data?.version;
  const updated: string | undefined = data?.updated;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6 text-center">
        <h1 className="section-title text-3xl md:text-4xl">Menu</h1>
        <div className="mt-2 text-sm opacity-70">
          {version ? <span>{version}</span> : null}
          {updated ? (
            <span className="ml-2">
              • Updated {new Date(updated).toLocaleDateString()}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="brass-border rounded-full border px-4 py-2 text-sm font-semibold"
            style={{ color: 'var(--text)' }}
          >
            Open in new tab
          </a>
          <a
            href={pdfUrl + '?dl='}
            className="btn-pop btn-shadow brass-border rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: 'var(--cta)', color: '#1B1612' }}
            download
          >
            Download PDF
          </a>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl ring-1 ring-[var(--line)]">
        <object
          data={pdfUrl}
          type="application/pdf"
          className="h-[80vh] w-full"
        >
          <div className="p-6 text-center">
            <p className="opacity-80">
              It looks like your browser can’t display PDFs inline.
            </p>
            <p className="mt-2">
              <a
                className="underline"
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the menu PDF in a new tab
              </a>
              .
            </p>
          </div>
        </object>
      </div>
    </div>
  );
}
