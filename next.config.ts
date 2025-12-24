import type { NextConfig } from "next";

/**
 * Security Headers Configuration
 * These headers protect against common web vulnerabilities
 */
const securityHeaders = [
  // Prevent clickjacking attacks
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Enable XSS filter in older browsers
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // DNS prefetching optimization
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Prevent embedding in iframes (except same origin)
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' blob:",
      "connect-src 'self' https://api.stripe.com https://challenges.cloudflare.com wss:",
      "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  },
  // Restrict browser features
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()', // Disable FLoC
      'accelerometer=()',
      'gyroscope=()',
      'magnetometer=()',
      'usb=()',
      'payment=(self)', // Allow Stripe
    ].join(', '),
  },
  // Force HTTPS in production
  ...(process.env.NODE_ENV === 'production' ? [{
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  }] : []),
];

const nextConfig: NextConfig = {
  // PERFORMANCE FIX: Bundle size optimization
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Enable experimental features for better optimization
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: [
      'lucide-react', // Tree-shake lucide icons
      'framer-motion', // Tree-shake framer-motion (if still used)
      '@stripe/stripe-js',
    ],
  },

  // PERFORMANCE FIX: Turbopack configuration (Next.js 16+)
  // Turbopack handles bundle splitting and tree-shaking automatically
  turbopack: {
    // Empty config to enable Turbopack without warnings
    // Turbopack automatically optimizes:
    // - Code splitting
    // - Tree shaking
    // - Bundle optimization
    // - Fast refresh
  },

  images: {
    // PERFORMANCE FIX: Proper image optimization configuration
    formats: ['image/avif', 'image/webp'], // Modern formats with better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Common device sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Common icon/thumb sizes
    minimumCacheTTL: 86400, // Cache images for 1 day (86400 seconds)
    dangerouslyAllowSVG: false, // Security: prevent SVG XSS attacks
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'share.google',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.blob.vercel-storage.com',
      },
    ],
  },
  
  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Stricter headers for API routes
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          // Prevent caching of API responses with sensitive data
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
