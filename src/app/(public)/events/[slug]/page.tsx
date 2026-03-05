//src/app/(public)/events/[slug]/page.tsx
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

import EventGalleryCarousel from '@/components/gallery/EventGalleryCarousel.client';

export const revalidate = 60;

// Calgary / Mountain Time (handles DST properly)
const EVENT_TZ = process.env.EVENT_TZ || 'America/Edmonton';

type SanityEvent = {
  _id: string;
  title: string;
  slug: string;
  venueKey: string;
  status: string; // draft | on_sale | ended | cancelled
  startsAt: string;
  endsAt?: string | null;
  shortDescription?: string | null;
  body?: PortableTextBlock[];
  heroImage?: SanityImageSource;
  gallery?: Array<{ caption?: string | null; image: SanityImageSource }> | null;
  ticketTypes?: Array<{
    _key: string;
    name: string;
    salesEndAt?: string | null;
  }> | null;
};

type Params = { slug: string };

function formatEventDay(iso: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

function formatEventTime(iso: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TZ,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const event = await client
    .fetch<SanityEvent | null>(qEventBySlug, { slug })
    .catch(() => null);

  if (!event) return notFound();

  // show on_sale + ended, hide cancelled + draft
  if (event.status === 'cancelled' || event.status === 'draft')
    return notFound();

  const summary =
    event.status === 'on_sale'
      ? await getPrimaryTicketTypeSummaryBySanityEventId(event._id)
      : null;

  const ticketSaleEndsAt =
    event.ticketTypes?.find(
      (t) => t._key && t._key === summary?.sanityTicketTypeId,
    )?.salesEndAt ??
    event.ticketTypes?.[0]?.salesEndAt ??
    null;

  const fallbackOg = '/images/og/jungle-bird-og.webp';

  const heroUrl = event.heroImage
    ? urlFor(event.heroImage).width(1600).height(900).fit('crop').url()
    : fallbackOg;

  const eventDay = formatEventDay(event.startsAt);
  const startTime = formatEventTime(event.startsAt);
  const endTime = event.endsAt ? formatEventTime(event.endsAt) : null;

  const galleryItems =
    event.gallery?.map((g) => ({
      image: g.image,
      caption: g.caption ?? undefined,
    })) ?? [];

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

        <div className="mt-2 space-y-1 text-white/70">
          <p>
            <span className="text-white/60">Event day:</span> {eventDay}
          </p>
          <p>
            <span className="text-white/60">Event time:</span> {startTime}
            {endTime ? ` to ${endTime}` : ''}
          </p>

          {event.status === 'ended' ? (
            <p className="pt-2 text-sm text-white/60">This event has ended.</p>
          ) : null}
        </div>

        {event.shortDescription ? (
          <p className="mt-4 text-white/80">{event.shortDescription}</p>
        ) : null}
      </div>

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="order-1 h-fit min-w-0 lg:sticky lg:top-24 lg:order-2">
          {event.status === 'on_sale' ? (
            summary ? (
              <BuyTicketsForm
                sanityEventId={event._id}
                sanityTicketTypeId={summary.sanityTicketTypeId ?? ''}
                eventTitle={event.title}
                ticketTypeName={summary.name}
                minPerOrder={summary.minPerOrder}
                maxPerOrder={summary.maxPerOrder}
                remaining={summary.remaining}
                unitAmountCents={summary.unitAmountCents}
                currency={summary.currency}
                ticketSaleEndsAt={ticketSaleEndsAt ?? event.startsAt}
              />
            ) : (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
                Tickets coming soon.
              </section>
            )
          ) : (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
              Ticket sales are closed.
            </section>
          )}
        </aside>

        <section className="order-2 min-w-0 rounded-2xl border border-white/10 bg-white/5 p-6 lg:order-1">
          <h2 className="text-xl font-semibold text-white">Details</h2>

          {event.body ? (
            <div className="mt-4">
              <EventBody value={event.body} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/70">Details coming soon.</p>
          )}

          {galleryItems.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white">Gallery</h3>
              <div className="mt-3 min-w-0">
                <EventGalleryCarousel items={galleryItems} />
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              No gallery photos yet.
            </div>
          )}
        </section>
      </div>

      {summary
        ? (() => {
            const salesEndIso = summary.salesEndAt ?? event.startsAt;
            const salesEnded = salesEndIso
              ? new Date(salesEndIso).getTime() <= Date.now()
              : false;

            return (
              <div className="mt-6 text-sm text-white/60">
                Price: {formatMoney(summary.unitAmountCents, summary.currency)}
                {!salesEnded
                  ? ` · Remaining: ${Math.max(0, summary.remaining)}`
                  : ''}
              </div>
            );
          })()
        : null}
    </main>
  );
}
