export type ReferrerCategory =
  | "ai_search"
  | "search"
  | "social"
  | "internal"
  | "direct"
  | "other";

export type ReferrerSubcategory =
  | "chatgpt"
  | "perplexity"
  | "claude"
  | "copilot"
  | "gemini"
  | "google_aio"
  | "you"
  | "phind"
  | "meta_ai"
  | "duck_assist"
  | "google"
  | "bing"
  | "duckduckgo"
  | "yandex"
  | "ecosia"
  | "brave"
  | "meta"
  | "x"
  | "reddit"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "whatsapp"
  | "unknown";

export interface Classification {
  category: ReferrerCategory;
  subcategory: ReferrerSubcategory;
  referrerHostname: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  fromUtmHint: boolean;
}

const AI_HOSTS: Record<string, ReferrerSubcategory> = {
  "chat.openai.com": "chatgpt",
  "chatgpt.com": "chatgpt",
  "www.chatgpt.com": "chatgpt",
  "perplexity.ai": "perplexity",
  "www.perplexity.ai": "perplexity",
  "claude.ai": "claude",
  "copilot.microsoft.com": "copilot",
  "gemini.google.com": "gemini",
  "bard.google.com": "gemini",
  "you.com": "you",
  "www.phind.com": "phind",
  "meta.ai": "meta_ai",
};

const SEARCH_HOSTS: Record<string, ReferrerSubcategory> = {
  "google.com": "google",
  "www.google.com": "google",
  "google.es": "google",
  "www.google.es": "google",
  "google.com.mx": "google",
  "google.com.ar": "google",
  "google.cl": "google",
  "bing.com": "bing",
  "www.bing.com": "bing",
  "duckduckgo.com": "duckduckgo",
  "yandex.com": "yandex",
  "yandex.ru": "yandex",
  "ecosia.org": "ecosia",
  "www.ecosia.org": "ecosia",
  "search.brave.com": "brave",
};

const SOCIAL_HOSTS: Record<string, ReferrerSubcategory> = {
  "facebook.com": "meta",
  "www.facebook.com": "meta",
  "m.facebook.com": "meta",
  "l.facebook.com": "meta",
  "lm.facebook.com": "meta",
  "instagram.com": "meta",
  "www.instagram.com": "meta",
  "l.instagram.com": "meta",
  "t.co": "x",
  "x.com": "x",
  "twitter.com": "x",
  "reddit.com": "reddit",
  "www.reddit.com": "reddit",
  "old.reddit.com": "reddit",
  "linkedin.com": "linkedin",
  "www.linkedin.com": "linkedin",
  "lnkd.in": "linkedin",
  "youtube.com": "youtube",
  "www.youtube.com": "youtube",
  "m.youtube.com": "youtube",
  "tiktok.com": "tiktok",
  "www.tiktok.com": "tiktok",
  "pinterest.com": "pinterest",
  "es.pinterest.com": "pinterest",
  "whatsapp.com": "whatsapp",
  "wa.me": "whatsapp",
};

const UTM_AI_SOURCES = new Set([
  "chatgpt",
  "openai",
  "perplexity",
  "perplexity.ai",
  "claude",
  "anthropic",
  "copilot",
  "bing-chat",
  "gemini",
  "bard",
]);

const UTM_AI_SUB: Array<[RegExp, ReferrerSubcategory]> = [
  [/perplex/, "perplexity"],
  [/claude|anthropic/, "claude"],
  [/copilot|bing-chat/, "copilot"],
  [/gemini|bard/, "gemini"],
];

const SELF_HOSTS = new Set(["homara.es", "www.homara.es", "localhost", "127.0.0.1"]);

function safeHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isGoogleAIO(referrerUrl: string | null, currentUrl: string): boolean {
  const refHost = safeHostname(referrerUrl);
  if (!refHost?.startsWith("google.")) return false;
  try {
    const u = new URL(currentUrl);
    const aio =
      u.searchParams.get("aio_source") ??
      u.searchParams.get("ref_src") ??
      u.searchParams.get("utm_source");
    if (aio && /aio|google_aio|sge|ai_overview/i.test(aio)) return true;
    if (u.searchParams.get("udm") === "50") return true;
  } catch {
    // invalid URL — fall through to default
  }
  return false;
}

export function classifyReferrer(input: {
  referrer: string | null;
  currentUrl: string;
}): Classification {
  const { referrer, currentUrl } = input;
  const refHost = safeHostname(referrer);

  let url: URL | null = null;
  try {
    url = new URL(currentUrl);
  } catch {
    url = null;
  }

  const utmSource = url?.searchParams.get("utm_source")?.toLowerCase() ?? null;
  const utmMedium = url?.searchParams.get("utm_medium")?.toLowerCase() ?? null;
  const utmCampaign = url?.searchParams.get("utm_campaign")?.toLowerCase() ?? null;

  const base = {
    referrerHostname: refHost,
    utmSource,
    utmMedium,
    utmCampaign,
    fromUtmHint: false,
  };

  if (utmSource && UTM_AI_SOURCES.has(utmSource)) {
    const sub = UTM_AI_SUB.find(([re]) => re.test(utmSource))?.[1] ?? "chatgpt";
    return { ...base, category: "ai_search", subcategory: sub, fromUtmHint: true };
  }

  if (refHost && isGoogleAIO(referrer ?? null, currentUrl)) {
    return { ...base, category: "ai_search", subcategory: "google_aio" };
  }

  if (refHost === "duckduckgo.com" && (referrer ?? "").includes("ia=chat")) {
    return { ...base, category: "ai_search", subcategory: "duck_assist" };
  }

  if (refHost === "www.bing.com" || refHost === "bing.com") {
    if ((referrer ?? "").match(/\/chat|showconv=|q=.*\bchat\b/i)) {
      return { ...base, category: "ai_search", subcategory: "copilot" };
    }
  }

  if (refHost && AI_HOSTS[refHost]) {
    return { ...base, category: "ai_search", subcategory: AI_HOSTS[refHost] };
  }
  if (refHost && SEARCH_HOSTS[refHost]) {
    return { ...base, category: "search", subcategory: SEARCH_HOSTS[refHost] };
  }
  if (refHost && SOCIAL_HOSTS[refHost]) {
    return { ...base, category: "social", subcategory: SOCIAL_HOSTS[refHost] };
  }
  if (refHost && SELF_HOSTS.has(refHost)) {
    return { ...base, category: "internal", subcategory: "unknown" };
  }
  if (!refHost) {
    return { ...base, category: "direct", subcategory: "unknown" };
  }
  return { ...base, category: "other", subcategory: "unknown" };
}
