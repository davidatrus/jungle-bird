import Image from 'next/image';
import Link from 'next/link';

type Props = {
  title: string;
  slug: string;
  startsAt: string;
  shortDescription?: string | null;
  badges: string[];
  remainingText?: string;
  imageUrl: string;
};

export default function EventCard({
  title,
  slug,
  startsAt,
  shortDescription,
  badges,
  remainingText,
  imageUrl,
}: Props) {
  const dateStr = new Date(startsAt).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Link
      href={`/events/${slug}`}
      className="block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
    >
      <div className="relative h-40 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover sepia"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>

          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/90"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-2 text-sm text-white/70">{dateStr}</p>

        {shortDescription ? (
          <p className="mt-3 text-sm text-white/80">{shortDescription}</p>
        ) : null}

        {remainingText ? (
          <div className="mt-4 text-sm text-white/70">{remainingText}</div>
        ) : null}

        <div className="mt-4 text-sm font-medium text-white">
          View details →
        </div>
      </div>
    </Link>
  );
}
