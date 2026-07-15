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
  // './' resolves per-route against metadataBase → each page canonicalizes itself.
  alternates: { canonical: './' },
  title: {
    default: 'West Arlan Group — проектирование и строительство инфраструктуры в Казахстане',
    template: '%s | West Arlan Group',
  },
  description:
    'Полный цикл работ: проектирование, СМР и обслуживание инженерных сетей, промышленных и транспортных объектов по всему Казахстану. Лицензии I категории, офис в Актобе.',
  keywords: [
    'строительная компания Казахстан',
    'проектирование инженерных сетей',
    'строительно-монтажные работы',
    'промышленное строительство',
    'инженерные изыскания',
    'техническое обслуживание инфраструктуры',
    'строительный подрядчик Актобе',
    'West Arlan Group',
    'WAG',
  ],
  openGraph: {
    type:   'website',
    locale: 'ru_RU',
    url:    SITE_URL,
    siteName: 'West Arlan Group',
    title:    'West Arlan Group — проектирование и строительство инфраструктуры',
    description: 'Проектирование, СМР и обслуживание инженерных сетей, промышленных и транспортных объектов по всему Казахстану.',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'West Arlan Group — проектирование и строительство инфраструктуры',
    description: 'Проектирование, СМР и обслуживание инженерных сетей, промышленных и транспортных объектов по всему Казахстану.',
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
  // ProfessionalService — подтип LocalBusiness и Organization: даёт локальную
  // выдачу (адрес/телефон/регион) поверх обычной организационной разметки.
  '@type': 'ProfessionalService',
  '@id': `${SITE_URL}/#organization`,
  name: 'West Arlan Group',
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`, // raster logo.png not yet available; SVG icon is the canonical mark
  image: `${SITE_URL}/opengraph-image`,
  description:
    'Проектирование и строительство инженерной и железнодорожной инфраструктуры в Казахстане. Полный цикл: от изысканий до сдачи объекта «под ключ».',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Актобе',
    addressRegion: 'Актюбинская область',
    addressCountry: 'KZ',
    streetAddress: 'ул. Казангапа дом 57В, офис 34',
  },
  telephone: '+7-7132-538-288',
  email: 'west_arlan-group@mail.ru',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+7-7132-538-288',
    email: 'west_arlan-group@mail.ru',
    contactType: 'customer service',
    availableLanguage: ['Russian', 'Kazakh'],
  },
  areaServed: {
    '@type': 'Country',
    name: 'Казахстан',
  },
  knowsAbout: [
    'строительно-монтажные работы',
    'проектирование инженерных сетей',
    'инженерные изыскания',
    'промышленное строительство',
    'техническое обслуживание инфраструктуры',
  ],
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
