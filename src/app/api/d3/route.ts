import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { encodeObfuscated, readObfuscatedQuery } from "@/lib/obfuscation";

// url.csv is the curated list of /listings/ URLs that are actually meant to
// be indexed/crawled — everything else (condition-only pages, deep filter
// combos, etc.) gets a stripped-down hero (no banner image, no description)
// on the demo pages. Parsed once per server instance, not per request.
let indexedPaths: Set<string> | null = null;

function normalize(url: string): string {
  return url
    .replace(/^https?:\/\/[^/]+/, "")
    .trim()
    .toLowerCase()
    .replace(/\/+$/, "");
}

function loadIndexedPaths(): Set<string> {
  if (indexedPaths) return indexedPaths;
  const csvPath = path.join(process.cwd(), "src", "app", "url.csv");
  const raw = fs.readFileSync(csvPath, "utf-8");
  const set = new Set<string>();
  // One URL per line — no header row, no tab-separated columns.
  for (const line of raw.split("\n")) {
    const url = line.trim();
    if (url) set.add(normalize(url));
  }
  indexedPaths = set;
  return set;
}

export async function GET(request: NextRequest) {
  const searchParams = readObfuscatedQuery(request.nextUrl.searchParams);
  const targetPath = searchParams.get("path") ?? "";
  const indexed = loadIndexedPaths().has(normalize(targetPath));
  // Body is obfuscated (see @/lib/obfuscation) so it isn't plain-readable
  // straight off the DevTools Network "Preview"/"Response" tab.
  return new NextResponse(encodeObfuscated({ indexed }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
