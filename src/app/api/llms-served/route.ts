import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { after } from "next/server";
import { detectAiCrawler } from "@/infrastructure/analytics/ai-crawlers";
import { mpEvent } from "@/infrastructure/analytics/measurement-protocol";

const FILE_MAP: Record<string, { fileName: string; path: string }> = {
  llms: { fileName: "llms.txt", path: "/llms.txt" },
  full: { fileName: "llms-full.txt", path: "/llms-full.txt" },
};

const bodyCache = new Map<string, string>();

async function loadBody(fileName: string): Promise<string | null> {
  const cached = bodyCache.get(fileName);
  if (cached !== undefined) return cached;
  try {
    const body = await readFile(join(process.cwd(), "public", fileName), "utf-8");
    bodyCache.set(fileName, body);
    return body;
  } catch {
    return null;
  }
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const fileKey = url.searchParams.get("file");
  const target = fileKey ? FILE_MAP[fileKey] : undefined;
  if (!target) {
    return new Response("Not found", { status: 404 });
  }

  const body = await loadBody(target.fileName);
  if (body === null) {
    return new Response("Not found", { status: 404 });
  }

  const bot = detectAiCrawler(request.headers.get("user-agent"));
  if (bot) {
    after(() =>
      mpEvent({
        clientId: `bot-${bot}`,
        eventName: "ai_crawler_visit",
        params: { bot, file: target.fileName, path: target.path },
      }),
    );
  }

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
      "x-robots-tag": "all",
    },
  });
}
