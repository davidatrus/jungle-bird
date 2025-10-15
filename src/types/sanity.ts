// Minimal image source type to satisfy TS without pulling in 'sanity'
export type SanityImageRef =
  | { _ref: string }
  | { asset: { _ref: string } }
  | { asset: { _id: string } };

export type SanityImageSource = string | SanityImageRef;
