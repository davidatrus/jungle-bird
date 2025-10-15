import ContactForm from './ContactForm';
import { client } from '@/sanity/client';
import { qSettings, qFaq } from '@/sanity/queries';

export const revalidate = 60;

type Hour = { days: string; time: string };
type Settings = {
  address?: string;
  email?: string;
  hours?: Hour[];
};
type Faq = { question: string; answer: string };

export default async function ContactPage() {
  const [settings, faqs] = await Promise.all([
    client.fetch<Settings>(qSettings).catch(() => null),
    client.fetch<Faq[]>(qFaq).catch(() => []),
  ]);

  const address = settings?.address || 'Address coming soon.';
  const email = settings?.email || 'info@example.com';

  return (
    <div className="space-y-10">
      <header className="text-center">
        <h1 className="font-display text-3xl md:text-4xl">CONTACT US</h1>
        <p className="mt-2 opacity-80">
          Reach out for reservations, events, or press.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <div className="space-y-5">
          <div>
            <h2 className="font-display text-lg">ADDRESS</h2>
            <p className="whitespace-pre-line opacity-80">{address}</p>
          </div>

          <div>
            <h2 className="font-display text-lg">EMAIL</h2>
            <p>
              <a
                className="underline underline-offset-4 hover:opacity-90"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            </p>
          </div>

          <div>
            <h2 className="font-display text-lg">HOURS</h2>
            <p className="opacity-80">
              {settings?.hours?.length ? (
                settings.hours.map((h: Hour) => (
                  <span key={h.days + h.time} className="block">
                    {h.days}: {h.time}
                  </span>
                ))
              ) : (
                <>Hours coming soon.</>
              )}
            </p>
          </div>
        </div>

        <ContactForm to={email} />
      </section>

      <section className="pt-2">
        <h2 className="font-display mb-4 text-2xl">FAQ</h2>
        {!faqs?.length ? (
          <p className="opacity-80">No FAQs yet.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((f: Faq, i: number) => (
              <details key={i} className="brass-border rounded-lg border p-4">
                <summary className="font-ui cursor-pointer tracking-[0.08em] uppercase">
                  {f.question}
                </summary>
                <p className="mt-2 whitespace-pre-line opacity-80">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
