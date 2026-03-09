import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["postgres"],
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "res.cloudinary.com",
  //     },
  //   ],
  // },
  images: {
    domains: ["res.cloudinary.com"],
  },
  reactStrictMode: true,
};

export default nextConfig;