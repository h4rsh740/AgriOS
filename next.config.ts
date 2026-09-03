import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "earthengine.googleapis.com",
      },
    ],
  },
  serverExternalPackages: [],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
