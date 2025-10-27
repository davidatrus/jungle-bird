import localFont from 'next/font/local';

export const begumSemiBold = localFont({
  src: [
    { path: './fonts/Begum-SemiBold.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-begum',
});

export const mikadoBold = localFont({
  src: [{ path: './fonts/Mikado-Bold.woff', weight: '700', style: 'normal' }],
  display: 'swap',
  variable: '--font-mikado',
});
