import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins:
        process.env.NODE_ENV === "development"
          ? [
              "localhost:3000",
              "zany-pancake-x5qqg75jwq4c6v6r-3000.app.github.dev",
            ]
          : [],
    },
  },
};

export default nextConfig;
