import type { Metadata } from 'next';
import Script from 'next/script';
import { Space_Grotesk, Onest, Outfit } from 'next/font/google';
import './globals.css';
import GlobalAnim from '@/components/ui/GlobalAnim';
import HeaderWrapper from '@/components/Header/HeaderWrapper';
import SmoothScroll from '@/components/ui/SmoothScroll';
import Tilt from '@/components/ui/Tilt';
import CursorLogo from '@/components/ui/CursorLogo';
import { SITE_URL } from '@/lib/site';

/* Space Grotesk and Outfit have no Cyrillic subset; Russian/Kazakh glyphs
   automatically fall back to Onest in the CSS font-family chain. */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-heading',
});

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'West Arlan Group',
    template: '%s | West Arlan Group',
  },
  description:
    'West Arlan Group — проектирование и строительство инженерной и железнодорожной инфраструктуры в Казахстане. Полный цикл: от изысканий до сдачи объекта «под ключ».',
  keywords: [
    'строительство железнодорожных путей',
    'инженерная инфраструктура',
    'геодезические изыскания',
    'проектирование',
    'Казахстан',
    'West Arlan Group',
    'WAG',
  ],
  openGraph: {
    type:   'website',
    locale: 'ru_RU',
    url:    SITE_URL,
    siteName: 'West Arlan Group',
    title:    'West Arlan Group',
    description: 'Проектирование и строительство инженерной и железнодорожной инфраструктуры в Казахстане.',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'West Arlan Group',
    description: 'Проектирование и строительство инженерной и железнодорожной инфраструктуры в Казахстане.',
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:              true,
      follow:             true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'West Arlan Group',
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`, // raster logo.png not yet available; SVG icon is the canonical mark
  description:
    'Проектирование и строительство инженерной и железнодорожной инфраструктуры в Казахстане.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Актобе',
    addressRegion: 'Актюбинская область',
    addressCountry: 'KZ',
    streetAddress: 'ул. Казангапа дом 57В, офис 34',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+7-7132-538-288',
    contactType: 'customer service',
    availableLanguage: ['Russian', 'Kazakh'],
  },
  areaServed: 'KZ',
  sameAs: [],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fontVars = `${spaceGrotesk.variable} ${onest.variable} ${outfit.variable}`;
  return (
    <html lang="ru" data-scroll-behavior="smooth" className={fontVars}>
      <head>
        <Script
          id="json-ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SmoothScroll />
        <HeaderWrapper />
        {children}
        <GlobalAnim />
        <Tilt />
        <CursorLogo />
      </body>
    </html>
  );
}
