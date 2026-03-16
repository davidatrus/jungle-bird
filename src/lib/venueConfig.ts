export type VenueKey = 'jungle_bird' | 'prohibition';

type VenueConfig = {
  brandName: string;
  shortName: string;
  basePath: string;
  siteUrl: string;

  logo: {
    src: string;
    alt: string;
  };

  hero: {
    videoSrc: string;
    title: string;
    subtitle: string;
    menuHref: string;
    wordmarkSrc?: string;
    wordmarkAlt?: string;
  };

  about: {
    imageSrc: string;
    imageAlt: string;
    heading: string;
    paragraphs: string[];
  };

  menuCta: {
    heading: string;
    subtext: string;
    href: string;
    backgroundImageSrc: string;
  };

  location: {
    imageSrc: string;
    imageAlt: string;
  };

  reservations: {
    widgetScriptSrc: string | null;
    fallbackMessage?: string;
  };
};

const venueConfigs: Record<VenueKey, VenueConfig> = {
  jungle_bird: {
    brandName: 'Jungle Bird',
    shortName: 'Jungle Bird',
    basePath: '',
    siteUrl: 'https://www.junglebirdtikiyyc.com',
    logo: {
      src: '/images/logo/icon.png',
      alt: 'Jungle Bird logo',
    },
    hero: {
      videoSrc: '/video/hero_loop.mp4',
      title: 'JUNGLE BIRD',
      subtitle: 'Tiki Cave & Lounge',
      menuHref: '/menu',
    },
    about: {
      imageSrc: '/images/misc/interior.webp',
      imageAlt:
        'Inside Jungle Bird Tiki Lounge on 17th Ave Calgary with glowing tiki bar, bamboo textures, and tropical rum display',
      heading: 'Calgary’s Hottest TIKI-CAVE Lounge',
      paragraphs: [
        'Descend beneath 17th Ave into a fire-lit hideaway of rum, smoke, and jungle rhythms. Our cave glows warm and welcome. Where craft tiki meets sultry basement lounge.',
        'Think basalt and bamboo, torches and tropicals. A cavernous lounge where heat and haze meet bright citrus and island spice. Settle into the warmth; the night slows down here.',
      ],
    },
    menuCta: {
      heading: 'Our Menu',
      subtext: 'Classic & remastered cocktails, exquisite eats, and beyond.',
      href: '/menu',
      backgroundImageSrc: '/images/misc/menu-bg.jpg',
    },
    location: {
      imageSrc: '/images/misc/jungle-bird-map.webp',
      imageAlt: 'Map showing Jungle Bird location',
    },
    reservations: {
      widgetScriptSrc:
        '//www.opentable.ca/widget/reservation/loader?rid=1471021&type=standard&theme=standard&color=1&dark=false&iframe=true&domain=ca&lang=en-CA&newtab=false&ot_source=Restaurant%20website&cfe=true',
      fallbackMessage:
        'If the widget does not load, try disabling strict tracking protection or open in a private window.',
    },
  },

  prohibition: {
    brandName: 'Prohibition',
    shortName: 'Prohibition',
    basePath: '/prohibition',
    siteUrl: 'https://www.junglebirdtikiyyc.com/prohibition',
    logo: {
      src: '/images/logo/Logo-copy.png',
      alt: 'Prohibition Lounge logo',
    },
    hero: {
      videoSrc: '/video/PRO2.mp4',
      title: 'PROHIBITION',
      subtitle: 'COCKTAIL BAR & LOUNGE',
      menuHref: '/prohibition/menu',
      wordmarkSrc: '/images/logo/Logo-copy.png',
      wordmarkAlt: 'Prohibition Lounge wordmark',
    },
    about: {
      imageSrc: '/images/misc/prohibition-interior.webp',
      imageAlt:
        'Inside Prohibition in Calgary with moody lighting, vintage speakeasy atmosphere, and intimate lounge seating',
      heading: 'Rewind to the Prohibition Era',
      paragraphs: [
        'Alcohol was banned but the party never stopped.',
        'Underground speakeasy bars were booming, flappers were dancing, and the drinks were always flowing.',
        'When you walk through our doors, we take you back in time.',
        'Our establishment is an authentic vintage 1920s speakeasy bar, with swing and jazz music, meticulously crafted cocktails, and vintage decor that captures the essence of the era.',
      ],
    },
    menuCta: {
      heading: 'Our Menu',
      subtext:
        'Have a Look at Our Classic & Remastered Cocktails, Exquisite Eats, and Beyond',
      href: '/prohibition/menu',
      backgroundImageSrc: '/images/misc/menu-bg-pb.webp',
    },
    location: {
      imageSrc: '/images/misc/prohibition-map.webp',
      imageAlt: 'Map showing Prohibition location',
    },
    reservations: {
      widgetScriptSrc: null,
      fallbackMessage:
        'Reservations for Prohibition will be added here once the booking widget is ready.',
    },
  },
};

export function getVenueConfig(
  venueKey: VenueKey = 'jungle_bird',
): VenueConfig {
  return venueConfigs[venueKey] ?? venueConfigs.jungle_bird;
}
