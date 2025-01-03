import type { NextConfig } from "next";
import * as path from "path"
import { config } from "dotenv";

config({ path: path.resolve(__dirname, '../.env') });

const nextConfig: NextConfig = {
  env: {
    CLIENT_URL: process.env.CLIENT_URL,
    PORT: process.env.PORT,
  },
  async rewrites() {
    return [
      {
        "source": "/api/:path*",
        "destination": `http://localhost:${process.env.PORT}/api/:path*`
      }
    ]
  },
};

export default nextConfig;
