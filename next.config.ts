import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow server-side packages that need native bindings
  serverExternalPackages: ['pdf-parse', 'mammoth'],

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Disable powered-by header
  poweredByHeader: false,
};

export default nextConfig;
