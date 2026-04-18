import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude temp directories from file watcher and build output tracing
  outputFileTracingExcludes: {
    '*': ['_pdf_pages/**', '_design_pages/**', '*.py', 'Портфолио*'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'commons.wikimedia.org' },
      { protocol: 'https', hostname: '*.wikipedia.org' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
