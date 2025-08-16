import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  experimental: {
    externalDir: true, // 👈 allows imports outside /frontend
  },
};

export default nextConfig;
