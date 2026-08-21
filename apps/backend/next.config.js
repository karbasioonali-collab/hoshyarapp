/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@hoshyar/database", "@hoshyar/shared"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
};

module.exports = nextConfig;
