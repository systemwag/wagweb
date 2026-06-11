import type { NextConfig } from "next";

// CSP: 'unsafe-inline' scripts are required by Next's inline runtime + JSON-LD;
// 'unsafe-eval' only in dev (React Refresh). Styles are inline-heavy (next/font,
// styled JSX) so 'unsafe-inline' stays. Supabase is the only external origin.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const nextConfig: NextConfig = {
  // Exclude temp directories from file watcher and build output tracing
  outputFileTracingExcludes: {
    '*': ['_pdf_pages/**', '_design_pages/**', '*.py', 'Портфолио*'],
  },
  images: {
    remotePatterns: [
      // Project images served from Supabase Storage public URLs.
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  devIndicators: false,
  async headers() {
    return [
      {
        // Apply baseline security headers to every route.
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // SAMEORIGIN (not DENY): /admin/portfolio previews the PDF in a
          // same-origin <iframe>.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
