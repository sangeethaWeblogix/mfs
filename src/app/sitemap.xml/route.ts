// src/app/sitemap.xml/route.ts
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.MFS_API_KEY;

// Static fallback — used if the live /sitemap check fails, and as the
// baseline for sitemaps (like blogs) the API doesn't know about.
const DEFAULT_SITEMAPS = [
  "general-sitemap.xml",
  "listings-sitemap.xml",
  "states-sitemap.xml",
  "regions-sitemap.xml",
  "makes-sitemap.xml",
  "blogs-sitemap.xml",
  "models-sitemap.xml",
  "vehicle-makes-sitemap.xml",
  "state-make-sitemap.xml",
  "region-make-sitemap.xml",
  "state-vehicle-make-sitemap.xml",
  "region-vehicle-make-sitemap.xml",
  "weights-sitemap.xml",
  "prices-sitemap.xml",
  "length-sitemap.xml",
  "attributes-others-sitemap.xml",
];

// Maps the API's sitemap keys to this app's actual `*-sitemap.xml` route
// folders — names don't match 1:1 (e.g. "base" -> general, "price" -> prices,
// "gvm" -> weights). Unknown keys are skipped rather than guessed at.
const SITEMAP_KEY_TO_FILE: Record<string, string> = {
  base: "general-sitemap.xml",
  listings: "listings-sitemap.xml",
  states: "states-sitemap.xml",
  regions: "regions-sitemap.xml",
  makes: "makes-sitemap.xml",
  models: "models-sitemap.xml",
  "vehicle-makes": "vehicle-makes-sitemap.xml",
  "state-make": "state-make-sitemap.xml",
  "region-make": "region-make-sitemap.xml",
  "state-vehicle-make": "state-vehicle-make-sitemap.xml",
  "region-vehicle-make": "region-vehicle-make-sitemap.xml",
  length: "length-sitemap.xml",
  gvm: "weights-sitemap.xml",
  price: "prices-sitemap.xml",
};

async function fetchSitemapList(): Promise<string[]> {
  if (!API_BASE) return DEFAULT_SITEMAPS;
  try {
    const res = await fetch(`${API_BASE}/sitemap`, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
      },
      cache: "no-store",
    });
    if (!res.ok) return DEFAULT_SITEMAPS;

    const raw = await res.text();
    const idx = raw.indexOf('{"');
    const json = JSON.parse(idx > 0 ? raw.slice(idx) : raw);
    const keys: string[] = json?.sitemaps ?? [];
    if (!keys.length) return DEFAULT_SITEMAPS;

    const files = keys.map((k) => SITEMAP_KEY_TO_FILE[k]).filter(Boolean) as string[];
    // "blogs" (WordPress posts) and "attributes-others" (Sleeping Capacity +
    // per-state Price/GVM/Length bands — see that route's own comment) are
    // not part of this product-sitemap API — always included alongside
    // whatever the API reports.
    return Array.from(new Set([...files, "blogs-sitemap.xml", "attributes-others-sitemap.xml"]));
  } catch {
    return DEFAULT_SITEMAPS;
  }
}

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.motorhomesforsale.com.au";

  const sitemaps = await fetchSitemapList();

  const lastModified = new Date().toISOString().split("T")[0];

  // 🚀 Build XML — no trim, no space before XML declaration
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps.map(
      (file) => `  <sitemap>
    <loc>${siteUrl}/${file}</loc>
    <lastmod>${lastModified}</lastmod>
  </sitemap>`,
    ),
    "</sitemapindex>",
  ].join("\n");

  // ✅ Send as raw UTF-8 bytes (so header stays visible)
  return new NextResponse(Buffer.from(xml, "utf-8"), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
