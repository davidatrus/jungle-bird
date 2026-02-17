import { client } from '@/sanity/client';
import { qEventsList } from '@/sanity/queries';
import EventCard from '@/components/events/EventCard';
import { computeBadges, getAvailabilityBySanityEventIds } from '@/lib/eventsDb';
import { urlFor } from '@/sanity/image';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const revalidate = 60;

type SanityEventListItem = {
  _id: string;
  _createdAt: string;
  title: string;
  slug: string;
  venueKey: string;
  status: string;
  startsAt: string;
  endsAt?: string | null;
  shortDescription?: string | null;
  isFeatured?: boolean;
  heroImage?: SanityImageSource;
};

export default async function EventsPage() {
  const events = await client
    .fetch<SanityEventListItem[]>(qEventsList)
    .catch(() => []);
  const ids = events.map((e) => e._id);
  const availabilityMap = await getAvailabilityBySanityEventIds(ids);
  const fallbackOg = '/images/og/jungle-bird-og.webp';

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Events</h1>
        <p className="mt-2 text-white/70">
          Tickets are limited. Grab yours before they sell out.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
          No events currently on sale.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((e) => {
            const av = availabilityMap[e._id]?.[0]; // MVP: first ticket type
            const badges = computeBadges({
              isFeatured: e.isFeatured,
              createdAt: e._createdAt,
              remaining: av?.remaining ?? null,
              capacity: av?.capacity ?? null,
            });
            // For now, we do not show DB price because your DB pricing is in ticket_types,
            // and availability view does not include unit_amount_cents. We will add that next.
            const remainingText =
              typeof av?.remaining === 'number'
                ? av.remaining <= 0
                  ? 'Sold out'
                  : `${av.remaining} left`
                : 'Tickets coming soon';
            const imageUrl = e.heroImage
              ? urlFor(e.heroImage).width(1200).height(630).fit('crop').url()
              : fallbackOg;

            return (
              <EventCard
                key={e._id}
                title={e.title}
                slug={e.slug}
                startsAt={e.startsAt}
                shortDescription={e.shortDescription}
                badges={badges}
                remainingText={remainingText}
                imageUrl={imageUrl}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
