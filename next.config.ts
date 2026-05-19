import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The data layer reads scraper/data/*.json at runtime. Force these files
  // into every route's serverless bundle so dynamic routes work on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./scraper/data/*.json"],
  },
};

export default nextConfig;
