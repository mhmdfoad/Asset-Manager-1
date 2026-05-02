import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-arabic',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-latin',
});

export const metadata: Metadata = {
  title: {
    template: '%s | متجر',
    default: 'متجر',
  },
  description: 'متجر إلكتروني متكامل',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') ?? 'ar';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${ibmPlexArabic.variable} ${inter.variable}`}
    >
      <body
        className={
          locale === 'ar'
            ? `${ibmPlexArabic.className} antialiased`
            : `${inter.className} antialiased`
        }
      >
        {children}
      </body>
    </html>
  );
}
