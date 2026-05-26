import type { MetadataRoute } from "next";
import { AI_CRAWLER_USER_AGENTS } from "@/infrastructure/analytics/ai-crawlers";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://homara.es";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
      { userAgent: "Googlebot", allow: "/", crawlDelay: 1 },
      { userAgent: "Bingbot", allow: "/", crawlDelay: 2 },
      { userAgent: "Twitterbot", allow: "/" },
      { userAgent: "facebookexternalhit", allow: "/" },
      ...AI_CRAWLER_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/", "/admin/"],
      })),
      // ByteDance — opt-out for now; revisit if/when LatAm strategy ramps.
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
