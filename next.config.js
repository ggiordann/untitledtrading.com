/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => [
    // Redirect HTTP to HTTPS
    {
      source: '/:path*',
      destination: 'https://untitledtrading.com/:path*',
      permanent: true,
      has: [
        {
          type: 'header',
          key: 'x-forwarded-proto',
          value: 'http',
        },
      ],
    },
    // Redirect www to non-www
    {
      source: '/:path*',
      destination: 'https://untitledtrading.com/:path*',
      permanent: true,
      has: [
        {
          type: 'host',
          value: 'www.untitledtrading.com',
        },
      ],
    },
  ],
};

module.exports = nextConfig;