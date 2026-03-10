import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["postgres"],
  images: {
    domains: ["res.cloudinary.com"],
  },
  reactStrictMode: true,
};

export default nextConfig;