type Props = {
  size?: number; // icon glyph size (inside the bubble)
  gap?: string; // spacing between icons (Tailwind class)
  topBar?: boolean; // lighter style for hero top row
  bubble?: boolean; // show subtle background bubble
  color?: string; // glyph color (default from theme)
};

type Item = { href: string; label: string; src: string };

const ICONS: Item[] = [
  {
    href: 'https://facebook.com/',
    label: 'Facebook',
    src: '/icons/facebook.svg',
  },
  {
    href: 'https://instagram.com/',
    label: 'Instagram',
    src: '/icons/instagram.svg',
  },
  { href: 'https://tiktok.com/', label: 'TikTok', src: '/icons/tiktok.svg' },
  {
    href: 'https://snapchat.com/',
    label: 'Snapchat',
    src: '/icons/snapchat.svg',
  },
];

export default function SocialIconsMask({
  size = 28,
  gap = 'gap-6',
  topBar = false,
  bubble = true,
  color,
}: Props) {
  const glyph = color ?? (topBar ? '#EFE7D8' : 'var(--text)'); // icon color
  const bubbleBg = topBar ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.06)'; // subtle bg

  return (
    <div className={`flex items-center ${gap}`}>
      {ICONS.map((it) => (
        <a
          key={it.label}
          href={it.href}
          aria-label={it.label}
          target="_blank"
          rel="noreferrer"
          title={it.label}
          className="transition-opacity hover:opacity-100"
          style={{ opacity: topBar ? 0.92 : 0.85 }}
        >
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: size + 12, // bubble size = glyph + padding
              height: size + 12,
              background: bubble ? bubbleBg : 'transparent',
              boxShadow: topBar
                ? '0 0 0 1px rgba(255,255,255,.06) inset'
                : 'none',
            }}
          >
            {/* The actual glyph, colored via CSS mask + background-color */}
            <span
              aria-hidden
              style={{
                width: size,
                height: size,
                backgroundColor: glyph, // icon color here
                WebkitMask: `url(${it.src}) center / contain no-repeat`,
                mask: `url(${it.src}) center / contain no-repeat`,
                display: 'block',
              }}
            />
          </span>
        </a>
      ))}
    </div>
  );
}
