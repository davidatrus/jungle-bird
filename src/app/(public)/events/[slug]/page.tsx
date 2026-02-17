import { notFound } from 'next/navigation';
import { client } from '@/sanity/client';
import { qEventBySlug } from '@/sanity/queries';
import BuyTicketsForm from '@/components/events/BuyTicketsForm';
import {
  getPrimaryTicketTypeSummaryBySanityEventId,
  formatMoney,
} from '@/lib/ticketTypeSummary';
import Image from 'next/image';
import { urlFor } from '@/sanity/image';
import EventBody from '@/components/events/EventBody';
import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const revalidate = 60;

type SanityEvent = {
  _id: string;
  title: string;
  slug: string;
  venueKey: string;
  status: string;
  startsAt: string;
  endsAt?: string | null;
  shortDescription?: string | null;
  body?: PortableTextBlock[];
  heroImage?: SanityImageSource;
};

type Params = { slug: string };

export default async function EventDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const event = await client
    .fetch<SanityEvent | null>(qEventBySlug, {
      slug,
    })
    .catch(() => null);

  if (!event) return notFound();
  if (event.status !== 'on_sale') return notFound();

  const summary = await getPrimaryTicketTypeSummaryBySanityEventId(event._id);
  const fallbackOg = '/images/og/jungle-bird-og.webp';

  const heroUrl = event.heroImage
    ? urlFor(event.heroImage).width(1600).height(900).fit('crop').url()
    : fallbackOg;

  const startsStr = new Date(event.startsAt).toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="mb-8">
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="relative h-64 w-full md:h-80">
            <Image
              src={heroUrl}
              alt={event.title}
              fill
              className="object-cover sepia"
              sizes="(max-width: 768px) 100vw, 1024px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">{event.title}</h1>
        <p className="mt-2 text-white/70">{startsStr}</p>

        {event.shortDescription ? (
          <p className="mt-4 text-white/80">{event.shortDescription}</p>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Details</h2>

          {event.body ? (
            <div className="mt-4">
              <EventBody value={event.body} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/70">Details coming soon.</p>
          )}
        </section>

        {summary ? (
          <BuyTicketsForm
            sanityEventId={event._id}
            eventTitle={event.title}
            ticketTypeName={summary.name}
            minPerOrder={summary.minPerOrder}
            maxPerOrder={summary.maxPerOrder}
            remaining={summary.remaining}
            unitAmountCents={summary.unitAmountCents}
            currency={summary.currency}
          />
        ) : (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
            Tickets coming soon.
          </section>
        )}
      </div>

      {summary ? (
        <div className="mt-6 text-sm text-white/60">
          Price: {formatMoney(summary.unitAmountCents, summary.currency)} ·
          Remaining: {Math.max(0, summary.remaining)}
        </div>
      ) : null}
    </main>
  );
}
