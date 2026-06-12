import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/app/providers";
import "@/app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a3d8f",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Homara — Comparador de hogar y jardín",
    template: "%s | Homara",
  },
  description:
    "Comparador editorial de productos para hogar y jardín. Reseñas, rankings y precios reales en electrodomésticos, terraza, decoración y muebles.",
  applicationName: "Homara",
  authors: [{ name: "Equipo editorial Homara" }],
  publisher: "Homara",
  generator: "Next.js",
  category: "Hogar y jardín",
  keywords: [
    "comparador hogar",
    "comparador jardín",
    "ofertas hogar",
    "guías de compra",
    "electrodomésticos",
    "terraza",
    "muebles",
    "decoración",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: "Homara",
    title: "Homara — Comparador de hogar y jardín",
    description:
      "Reseñas y comparativas editoriales de productos para hogar y jardín, con datos concretos y precios actualizados.",
    images: [
      { url: "/homara-mascot.webp", width: 512, height: 512, alt: "Mascota de Homara" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@homara_es",
    creator: "@homara_es",
    title: "Homara — Comparador de hogar y jardín",
    description: "Reseñas y comparativas editoriales con datos concretos.",
    images: ["/homara-mascot.webp"],
  },
  alternates: {
    canonical: "/",
    languages: {
      es: "/",
      "x-default": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
};

/**
 * Root layout. Owns the single `<html>`/`<body>` and the app-wide client
 * providers (TanStack Query etc.) so BOTH the public `[locale]` segment and the
 * non-localized `/admin` + `/api` routes inherit them. The public chrome
 * (Header/Footer/cookie banner/JSON-LD/analytics) and locale context live in
 * `src/app/[locale]/layout.tsx`.
 *
 * `lang="es"` is hardcoded because `es` is the only active locale. When a second
 * locale is added, move `<html lang>` resolution into the locale layout (see the
 * i18n decision note / add-a-language runbook).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
