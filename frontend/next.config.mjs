/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['posthog-node'],
  images: {
    domains: ['res.cloudinary.com', 'images.clerk.dev'],
    dangerouslyAllowSVG: true
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Disable strict mode for better Clerk compatibility
  reactStrictMode: false,
  // Redirect API routes to backend
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
