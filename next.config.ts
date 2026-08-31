import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // VOLTA already optimizes uploaded media before Storage. Keep Vercel's
    // responsive variant matrix deliberately small so one source image does not
    // fan out into many paid transformations.
    deviceSizes: [640, 960, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 180, 256, 384],
    // Store media uses immutable, versioned URLs on replacement, so transformed
    // variants are safe to reuse for a long period.
    minimumCacheTTL: 2_678_400,
    formats: ['image/webp'],
  },
}

export default nextConfig
