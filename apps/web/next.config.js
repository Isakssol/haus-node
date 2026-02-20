/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@haus-node/types", "@haus-node/node-registry"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.cloudflare.com" },
      { protocol: "https", hostname: "fal.media" },
      { protocol: "https", hostname: "*.fal.run" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
