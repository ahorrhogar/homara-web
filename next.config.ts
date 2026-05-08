import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
      { protocol: "https", hostname: "m.media-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "images-eu.ssl-images-amazon.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      { source: "/guias", destination: "/blog", permanent: true },
      { source: "/guias/:path*", destination: "/blog/:path*", permanent: true },
      { source: "/politica-cookies", destination: "/cookies", permanent: true },
      { source: "/condiciones-generales-de-uso", destination: "/aviso-legal", permanent: true },
    ];
  },
};

export default config;
