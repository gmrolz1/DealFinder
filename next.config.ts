import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The data layer reads scraper/data/*.json at runtime. Force these files
  // into every route's serverless bundle so dynamic routes work on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./scraper/data/*.json"],
  },
  // Clean ad URLs: /newcapital and /tagamo3 serve the Arabic campaign landing
  // pages (egy.deals/newcapital, egy.deals/tagamo3) while keeping the URLs
  // clean for Google Ads. The layout normalizes x-pathname so locale (RTL) +
  // standalone chrome are correct.
  async rewrites() {
    return [
      { source: "/newcapital", destination: "/ar/new-capital" },
      { source: "/tagamo3", destination: "/ar/fifth-settlement" },
    ];
  },
};

export default nextConfig;
