import { client } from '@/sanity/client';
import { qSettings } from '@/sanity/queries';
import HeroClient from './Hero.client';
import type { VenueKey } from '@/lib/venueConfig';

export const revalidate = 60;

type Settings = {
  social?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    snapchat?: string;
  };
};

export default async function Hero({
  venueKey = 'jungle_bird',
}: {
  venueKey?: VenueKey;
}) {
  const s = await client
    .fetch<Settings>(qSettings, { venueKey })
    .catch(() => null);

  return <HeroClient venueKey={venueKey} social={s?.social ?? undefined} />;
}
