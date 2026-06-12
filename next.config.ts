import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

// AI / LLM crawlers — long cache so the file is cheap to serve.
const LLMS_TXT_HEADERS = [
  ...SECURITY_HEADERS,
  { key: "Content-Type", value: "text/plain; charset=utf-8" },
  { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
  { key: "X-Robots-Tag", value: "all" },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.homara.es", pathname: "/**" },
      // Legacy origins — existing DB rows still point here; kept for back-compat.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
      { protocol: "https", hostname: "m.media-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "images-eu.ssl-images-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/llms.txt", headers: LLMS_TXT_HEADERS },
      { source: "/llms-full.txt", headers: LLMS_TXT_HEADERS },
    ];
  },
  async redirects() {
    return [
      { source: "/guias", destination: "/blog", permanent: true },
      { source: "/guias/:path*", destination: "/blog/:path*", permanent: true },
      { source: "/politica-cookies", destination: "/cookies", permanent: true },
      { source: "/condiciones-generales-de-uso", destination: "/aviso-legal", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/llms.txt", destination: "/api/llms-served?file=llms" },
      { source: "/llms-full.txt", destination: "/api/llms-served?file=full" },
    ];
  },
};

export default withNextIntl(config);
