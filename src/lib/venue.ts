// src/lib/venue.ts
export type VenueKey = 'jungle_bird' | 'prohibition';

export function getVenueKeyFromPath(pathname: string): VenueKey {
  // Anything under /prohibition uses prohibition
  return pathname.startsWith('/prohibition') ? 'prohibition' : 'jungle_bird';
}
