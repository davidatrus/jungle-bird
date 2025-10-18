// components/shared/SocialIconsMask.tsx
type Props = {
  size?: number;
  gap?: string;
  topBar?: boolean;
  bubble?: boolean;
  color?: string;
  links?: {
    facebook?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    snapchat?: string | null;
  } | null;
  placeholders?: boolean; // <-- NEW
};

type Item = { href?: string; label: string; src: string };

const BASE_ICONS: Omit<Item, 'href'>[] = [
  { label: 'Facebook', src: '/icons/facebook.svg' },
  { label: 'Instagram', src: '/icons/instagram.svg' },
  { label: 'TikTok', src: '/icons/tiktok.svg' },
  { label: 'Snapchat', src: '/icons/snapchat.svg' },
];

const toItems = (
  links?: Props['links'] | null,
  placeholders?: boolean,
): Item[] => {
  // If we have real links, build only those; if not and placeholders=true, render all as placeholders.
  if (links && Object.values(links).some(Boolean)) {
    return BASE_ICONS.flatMap((b) => {
      const href =
        b.label === 'Facebook'
          ? links.facebook
          : b.label === 'Instagram'
            ? links.instagram
            : b.label === 'TikTok'
              ? links.tiktok
              : b.label === 'Snapchat'
                ? links.snapchat
                : undefined;
      return href ? [{ ...b, href }] : [];
    });
  }
  return placeholders ? BASE_ICONS.map((b) => ({ ...b })) : [];
};

export default function SocialIconsMask({
  size = 28,
  gap = 'gap-6',
  topBar = false,
  bubble = true,
  color,
  links,
  placeholders = false, // default off except where you want it
}: Props) {
  const ICONS = toItems(links, placeholders);
  if (!ICONS.length) return null;

  const glyph = color ?? (topBar ? '#EFE7D8' : 'var(--text)');
  const bubbleBg = topBar ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.06)';

  return (
    <div className={`flex items-center ${gap}`}>
      {ICONS.map((it) => {
        const isPlaceholder = !it.href;
        const inner = (
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: size + 12,
              height: size + 12,
              background: bubble ? bubbleBg : 'transparent',
              boxShadow: topBar
                ? '0 0 0 1px rgba(255,255,255,.06) inset'
                : 'none',
              opacity: isPlaceholder ? 0.5 : topBar ? 0.92 : 0.85,
            }}
          >
            <span
              aria-hidden
              style={{
                width: size,
                height: size,
                backgroundColor: glyph,
                WebkitMask: `url(${it.src}) center / contain no-repeat`,
                mask: `url(${it.src}) center / contain no-repeat`,
                display: 'block',
              }}
            />
          </span>
        );

        return isPlaceholder ? (
          <span
            key={it.label}
            aria-label={it.label}
            title={`${it.label} (add link in Site Settings to enable)`}
            className="cursor-default"
          >
            {inner}
          </span>
        ) : (
          <a
            key={it.label}
            href={it.href}
            aria-label={it.label}
            target="_blank"
            rel="noreferrer"
            title={it.label}
            className="transition-opacity hover:opacity-100"
          >
            {inner}
          </a>
        );
      })}
    </div>
  );
}
