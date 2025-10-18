// src/components/layout/Navbar.tsx  (SERVER)
import { client } from '@/sanity/client';
import { qSettings } from '@/sanity/queries';
import NavbarClient from './Navbar.client';

export const revalidate = 60;

type Settings = { openTableUrl?: string | null };

export default async function Navbar() {
  const s = await client.fetch<Settings>(qSettings).catch(() => null);
  return <NavbarClient openTableUrl={s?.openTableUrl ?? null} />;
}
