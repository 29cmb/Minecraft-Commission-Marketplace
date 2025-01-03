import type { NextConfig } from "next";
import * as path from "path"
import { config } from "dotenv";

config({ path: path.resolve(__dirname, '../.env') });

const nextConfig: NextConfig = {
  env: {
    CLIENT_URL: process.env.CLIENT_URL,
    SERVER_URL: process.env.SERVER_URL,
    PORT: process.env.PORT,
  }
};

export default nextConfig;
