// src/components/events/EventBody.tsx
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

type Props = {
  value?: PortableTextBlock[] | null;
};

export default function EventBody({ value }: Props) {
  if (!value?.length) return null;

  return (
    <div className="prose prose-invert prose-p:text-white/80 prose-a:text-[var(--cta)] max-w-none">
      <PortableText value={value} />
    </div>
  );
}
