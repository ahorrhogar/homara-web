"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gaEvent } from "@/infrastructure/analytics/ga4";
import { getPageType } from "@/infrastructure/analytics/page-type";
import { editorialTrackingService } from "@/services/editorialTrackingService";

const SCROLL_THRESHOLDS = [25, 50, 75, 90] as const;
const READ_COMPLETE_DWELL_MS = 30_000;

function classifyLink(href: string, hostname: string): string {
  if (!href || href.startsWith("#")) return "anchor";
  if (href.startsWith("/producto/")) return "product";
  if (href.startsWith("/categoria/")) return "category";
  if (href.startsWith("/blog/")) return "blog";
  if (href.startsWith("/buscar")) return "search";
  if (href.startsWith("/api/redirect")) return "affiliate";
  if (href.startsWith("/")) return "internal";
  try {
    return new URL(href).hostname === hostname ? "internal" : "external";
  } catch {
    return "external";
  }
}

function deriveSlug(pathname: string): string {
  if (!pathname.startsWith("/blog/")) return "";
  return pathname.slice("/blog/".length).split("/")[0] ?? "";
}

export function EditorialEngagement() {
  const pathname = usePathname() ?? "";
  const slug = deriveSlug(pathname);

  useEffect(() => {
    if (!slug || typeof window === "undefined") return;
    if (getPageType(pathname) !== "blog_article") return;

    gaEvent("article_view", { slug });
    void editorialTrackingService.trackArticleView({ slug, path: pathname });

    const article = document.querySelector("article");
    if (!article) return;

    const mountedAt = Date.now();
    const seenScrollDepths = new Set<number>();
    let readCompleteFired = false;
    let rafId = 0;
    const hostname = window.location.hostname;

    function onScroll() {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const rect = article!.getBoundingClientRect();
        const articleHeight = rect.height;
        if (articleHeight <= 0) return;
        const scrolledThrough = Math.max(0, Math.min(articleHeight, window.innerHeight - rect.top));
        const ratio = (scrolledThrough / articleHeight) * 100;

        for (const threshold of SCROLL_THRESHOLDS) {
          if (ratio >= threshold && !seenScrollDepths.has(threshold)) {
            seenScrollDepths.add(threshold);
            gaEvent("article_scroll_depth", { slug, depth: threshold });
          }
        }

        if (!readCompleteFired && ratio >= 90 && Date.now() - mountedAt >= READ_COMPLETE_DWELL_MS) {
          readCompleteFired = true;
          gaEvent("article_read_complete", {
            slug,
            time_on_page_seconds: Math.round((Date.now() - mountedAt) / 1000),
          });
        }
      });
    }

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          gaEvent("article_section_view", {
            slug,
            section_id: el.id || null,
            section_heading: el.textContent?.slice(0, 120) ?? null,
            section_tag: el.tagName.toLowerCase(),
          });
          sectionObserver.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );
    article.querySelectorAll("h2, h3").forEach((h) => sectionObserver.observe(h));

    function onToggle(event: Event) {
      const target = event.target as HTMLDetailsElement;
      if (target.tagName !== "DETAILS" || !target.open) return;
      gaEvent("faq_question_expanded", {
        slug,
        question: target.querySelector("summary")?.textContent?.slice(0, 200) ?? null,
      });
    }

    function onClick(event: Event) {
      const link = (event.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!link || !article!.contains(link)) return;
      const href = link.getAttribute("href") ?? "";
      gaEvent("internal_link_clicked", {
        slug,
        href,
        link_kind: classifyLink(href, hostname),
        link_text: link.textContent?.slice(0, 120) ?? null,
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    article.addEventListener("toggle", onToggle, true);
    article.addEventListener("click", onClick);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      article.removeEventListener("toggle", onToggle, true);
      article.removeEventListener("click", onClick);
      sectionObserver.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return null;
}
