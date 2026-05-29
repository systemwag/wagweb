import type { NextConfig } from "next";

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
        ],
      },
    ];
  },
};

export default nextConfig;
