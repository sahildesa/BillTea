import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host', value: 'admin.localhost:3000' }],
          destination: '/admin/auth',
        },
        {
          source: '/:path((?!_next|api|uploads|favicon\\.ico|admin).*)',
          has: [{ type: 'host', value: 'admin.localhost:3000' }],
          destination: '/admin/:path',
        },
        {
          source: '/',
          has: [{ type: 'host', value: 'admin.localhost' }],
          destination: '/admin/auth',
        },
        {
          source: '/:path((?!_next|api|uploads|favicon\\.ico|admin).*)',
          has: [{ type: 'host', value: 'admin.localhost' }],
          destination: '/admin/:path',
        },
        {
          source: '/',
          has: [{ type: 'host', value: 'admin.billtea.com' }],
          destination: '/admin/auth',
        },
        {
          source: '/:path((?!_next|api|uploads|favicon\\.ico|admin).*)',
          has: [{ type: 'host', value: 'admin.billtea.com' }],
          destination: '/admin/:path',
        },
      ],
      afterFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: 'http://localhost:5000/uploads/:path*',
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
