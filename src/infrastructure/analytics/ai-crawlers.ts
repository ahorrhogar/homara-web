export const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Claude-Web",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "Applebot-Extended",
  "Amazonbot",
  "Diffbot",
  "DuckAssistBot",
  "MistralAI-User",
  "cohere-ai",
] as const;

export type AiCrawlerUserAgent = (typeof AI_CRAWLER_USER_AGENTS)[number];

const AI_CRAWLER_LOWER = AI_CRAWLER_USER_AGENTS.map((b) => b.toLowerCase());

export function detectAiCrawler(userAgent: string | null | undefined): AiCrawlerUserAgent | null {
  if (!userAgent) return null;
  const lower = userAgent.toLowerCase();
  for (let i = 0; i < AI_CRAWLER_LOWER.length; i++) {
    if (lower.includes(AI_CRAWLER_LOWER[i])) return AI_CRAWLER_USER_AGENTS[i];
  }
  return null;
}
