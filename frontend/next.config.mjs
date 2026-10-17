import path from "path";
import fs from "fs";

const cwd = fs.realpathSync?.native ? fs.realpathSync.native(process.cwd()) : process.cwd();

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(cwd, ".."),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
};

export default nextConfig;
