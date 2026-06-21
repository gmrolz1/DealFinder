import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The data layer reads scraper/data/*.json at runtime. Force these files
  // into every route's serverless bundle so dynamic routes work on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./scraper/data/*.json"],
  },
  // Clean ad URL: /newcapital serves the Arabic New Capital landing page
  // (egy.deals/newcapital) while keeping the URL clean for Google Ads. The
  // layout normalizes x-pathname so locale (RTL) + standalone chrome are correct.
  async rewrites() {
    return [{ source: "/newcapital", destination: "/ar/new-capital" }];
  },
};

export default nextConfig;
