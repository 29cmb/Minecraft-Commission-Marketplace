import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    CLIENT_URL: "http://localhost:40311",
    SERVER_URL: "http://localhost:61734",
    PORT: "61734",
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:61734/api/:path*`,
      },
    ];
  }
};

export default nextConfig;
