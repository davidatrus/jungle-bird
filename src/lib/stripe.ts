// src/lib/stripe.ts
import Stripe from 'stripe';
import type { VenueKey } from '@/lib/venueConfig';

function must(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function normalizeVenueKey(value: string | null | undefined): VenueKey {
  return value === 'prohibition' ? 'prohibition' : 'jungle_bird';
}

export function getStripeSecretKey(venueKey: VenueKey) {
  return venueKey === 'prohibition'
    ? must('STRIPE_SECRET_KEY_PB')
    : must('STRIPE_SECRET_KEY_JB');
}

export function getStripePublishableKey(venueKey: VenueKey) {
  return venueKey === 'prohibition'
    ? must('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PB')
    : must('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_JB');
}

export function getStripeWebhookSecrets() {
  return [
    {
      venueKey: 'jungle_bird' as const,
      secret: must('STRIPE_WEBHOOK_SECRET_JB'),
    },
    {
      venueKey: 'prohibition' as const,
      secret: must('STRIPE_WEBHOOK_SECRET_PB'),
    },
  ];
}

export function getStripeClient(venueKey: VenueKey) {
  return new Stripe(getStripeSecretKey(venueKey));
}
