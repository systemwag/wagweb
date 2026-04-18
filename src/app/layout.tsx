import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import GlobalAnim from '@/components/ui/GlobalAnim';
import GlobalVerticalBg from '@/components/ui/GlobalVerticalBg';
import HeaderWrapper from '@/components/Header/HeaderWrapper';

export const metadata: Metadata = {
  metadataBase: new URL('https://west-arlan.kz'),
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
    url:    'https://west-arlan.kz',
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
  url: 'https://west-arlan.kz',
  logo: 'https://west-arlan.kz/logo.png',
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
  return (
    <html lang="ru">
      <head>
        <Script
          id="json-ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <GlobalVerticalBg />
        <HeaderWrapper />
        <div style={{ position: 'relative', zIndex: 3 }}>
          {children}
          <GlobalAnim />
        </div>
      </body>
    </html>
  );
}
