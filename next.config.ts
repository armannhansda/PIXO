import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["postgres"],
  images: {
    domains: ["res.cloudinary.com", "images.unsplash.com", "plus.unsplash.com", "avatars.githubusercontent.com", "i.pravatar.cc"],
  },
  reactStrictMode: true,
};

export default nextConfig;