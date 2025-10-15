// src/sanity/image.ts
import imageUrlBuilder from '@sanity/image-url';
import { client } from './client';
import type { SanityImageSource as CustomSrc } from '@/types/sanity';

const builder = imageUrlBuilder(client);

// Use the actual type that builder.image expects
type BuilderSrc = Parameters<typeof builder.image>[0];

// Accept either your custom minimal type or the builder's full type
export const urlFor = (src: CustomSrc | BuilderSrc) =>
  builder.image(src as BuilderSrc);
