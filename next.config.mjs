/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "icoholder.com",
      "assets.aceternity.com",
      "ui.aceternity.com",
      "raw.githubusercontent.com",
    ],
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding", {
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    config.module.rules.push({
      test: /\.js$/,
      exclude: /hardhat/,
    });

    return config;
  },
};

export default nextConfig;
