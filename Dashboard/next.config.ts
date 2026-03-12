import type { NextConfig } from "next";
import path from "path";

// SECURITY FIX: Add HTTP Security Headers (MEDIUM #9)
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' https://snnriudqqwlphtnuhlex.supabase.co data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  },
];

const nextConfig: NextConfig = {
  // SECURITY FIX: Apply security headers check
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // SECURITY FIX: Move Supabase hostname to env var (LOW #12)
        hostname: process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME || 'snnriudqqwlphtnuhlex.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
};

export default nextConfig;

