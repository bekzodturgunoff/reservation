import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', 'recharts'],
  },
  output: 'export',
  trailingSlash: true,
  // basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '', // Uncomment and set if deploying to a subpath like username.github.io/repo-name
}

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig)
  : nextConfig
