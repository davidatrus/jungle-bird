//src/sanity/client.ts
import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // better for dev; you can switch true for prod later
  token:
    typeof window === 'undefined' ? process.env.SANITY_API_TOKEN : undefined,
});
