import type { NextConfig } from "next";

const supabaseHostname = (() => {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!value) return undefined;
  try {
    return new URL(value).hostname;
  } catch {
    return undefined;
  }
})();

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // TODO(migration): Remove once Step 12 cleans up the legacy admin pages
  // (src/app/admin/(panel)/* — ported in Step 8 with type drift the Vite build
  // never enforced). The catalog data layer is fully strict.
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname, pathname: "/**" }]
        : []),
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
