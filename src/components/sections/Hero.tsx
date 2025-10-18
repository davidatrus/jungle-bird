import { client } from '@/sanity/client';
import { qSettings } from '@/sanity/queries';
import HeroClient from './Hero.client';

export const revalidate = 60;

type Settings = {
  social?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    snapchat?: string;
  };
  openTableUrl?: string;
};

export default async function Hero() {
  const s = await client.fetch<Settings>(qSettings).catch(() => null);
  return (
    <HeroClient
      social={s?.social ?? undefined}
      openTableUrl={s?.openTableUrl ?? undefined}
    />
  );
}
