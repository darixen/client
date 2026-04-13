import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3001',
        // Add your specific GitHub Codespace domain here:
        'laughing-space-barnacle-55646rgqjqq37prr-3001.app.github.dev'
      ],
    },
  },
};

export default nextConfig;
