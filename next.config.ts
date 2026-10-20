import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: false,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  generateBuildId: async () => process.env.YOUEYE_BUILD_ID || null,
  output: "standalone" as const,
};

export default withSerwist(nextConfig);
