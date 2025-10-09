export type Post = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
};

export const posts: Post[] = [
  {
    id: '1',
    title: 'The Roaring Twenties: A Decade of Excess',
    excerpt: 'Step back into the era that inspired our lounge.',
    image: '/images/post-1.jpg',
    href: '/blog/the-roaring-twenties',
  },
  {
    id: '2',
    title: 'Behind the Cocktails',
    excerpt: 'How we remaster the classics for modern palates.',
    image: '/images/post-2.jpg',
    href: '/blog/behind-the-cocktails',
  },
  {
    id: '3',
    title: 'Choosing the Perfect Rum',
    excerpt: 'A quick guide from our bartenders.',
    image: '/images/post-3.jpg',
    href: '/blog/perfect-rum',
  },
];
