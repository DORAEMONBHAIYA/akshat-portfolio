import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-6d8dbdc6-a29b-44f6-ad5b-c1835af3cc0a.space.z.ai",
  ],
};

export default nextConfig;
