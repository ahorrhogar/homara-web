export type PageType =
  | "home"
  | "category"
  | "product"
  | "blog_hub"
  | "blog_article"
  | "search"
  | "assistant"
  | "legal"
  | "admin"
  | "other";

const LEGAL_PATHS = new Set([
  "/cookies",
  "/politica-privacidad",
  "/aviso-legal",
  "/acerca-de",
]);

export function getPageType(pathname: string | null | undefined): PageType {
  if (!pathname || pathname === "/" || pathname === "") return "home";
  if (pathname === "/blog") return "blog_hub";
  if (pathname.startsWith("/blog/")) return "blog_article";
  if (pathname.startsWith("/producto/")) return "product";
  if (pathname.startsWith("/categoria/")) return "category";
  if (pathname.startsWith("/buscar")) return "search";
  if (pathname.startsWith("/asistente")) return "assistant";
  if (pathname.startsWith("/admin")) return "admin";
  if (LEGAL_PATHS.has(pathname)) return "legal";
  return "other";
}
