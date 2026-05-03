import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

function buildRemotePatterns(): NonNullable<NonNullable<NextConfig['images']>['remotePatterns']> {
  const patterns: NonNullable<NonNullable<NextConfig['images']>['remotePatterns']> = [];

  const storeUrl = process.env.WOOCOMMERCE_STORE_URL?.trim().replace(/\/$/, '');
  if (storeUrl) {
    try {
      const parsed = new URL(storeUrl);
      patterns.push({
        protocol: parsed.protocol.replace(':', '') as 'https' | 'http',
        hostname: parsed.hostname,
        pathname: '/**',
      });
      // Also allow www subdomain variant
      if (!parsed.hostname.startsWith('www.')) {
        patterns.push({
          protocol: parsed.protocol.replace(':', '') as 'https' | 'http',
          hostname: `www.${parsed.hostname}`,
          pathname: '/**',
        });
      }
    } catch {
      // Invalid URL — skip image domain configuration
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.replit.dev', '*.pike.replit.dev', '*.repl.co'],
  images: {
    remotePatterns: buildRemotePatterns(),
  },
};

export default withNextIntl(nextConfig);
