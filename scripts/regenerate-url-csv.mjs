#!/usr/bin/env node
// Regenerates src/app/url.csv from the live backend sitemap API, so the
// "indexed URL" check (/api/indexed-url/, and [[...slug]]/page.tsx's own
// copy of the same check) stays in sync with real inventory instead of
// drifting from a stale one-off snapshot. Run on a schedule via
// .github/workflows/regenerate-url-csv.yml — this script itself has no
// server to talk to at cron time, so it hits the WordPress API directly
// (the same one NEXT_PUBLIC_MFS_API_BASE points the running app at),
// not the Next.js /*-sitemap.xml routes.
//
// Deliberately excludes: general-sitemap.xml (static pages, no product
// data), listings-sitemap.xml (individual /product/ pages — explicitly
// excluded from url.csv), and blogs-sitemap.xml (WordPress posts, not
// part of this API).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "src", "app", "url.csv");

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.MFS_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.motorhomesforsale.com.au";

if (!API_BASE) {
  console.error("NEXT_PUBLIC_MFS_API_BASE is not set — aborting.");
  process.exit(1);
}

// Every /sitemap/{type} the backend exposes that url.csv should track —
// mirrors src/lib/sitemapApi.ts's fetchSitemapPaths, called directly here
// since there's no running Next.js server for this script to call into.
const API_TYPES = [
  "states", "regions", "makes", "models", "vehicle-makes",
  "state-make", "region-make", "state-vehicle-make", "region-vehicle-make",
  "length", "gvm", "price",
];

async function fetchType(type) {
  try {
    const res = await fetch(`${API_BASE}/sitemap/${type}?min_count=1&bust_cache=0`, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
      },
    });
    if (!res.ok) {
      console.warn(`[${type}] HTTP ${res.status} — skipping`);
      return [];
    }
    const raw = await res.text();
    const idx = raw.indexOf('{"');
    const json = JSON.parse(idx > 0 ? raw.slice(idx) : raw);
    return Array.isArray(json?.paths) ? json.paths : [];
  } catch (err) {
    console.warn(`[${type}] fetch failed — skipping:`, err.message);
    return [];
  }
}

// attributes-others-sitemap.xml's paths aren't from the API at all (the
// backend has no "sleep" grouping) — kept in exact sync with that route's
// own PRICE_PATHS/GVM_PATHS/LENGTH_PATHS/SLEEP_PATHS/STATE_SLUGS constants.
const PRICE_PATHS = [
  "under-100000/", "between-100000-150000/", "between-150000-200000/",
  "between-200000-300000/", "over-300000/",
];
const GVM_PATHS = [
  "under-3500-kg-gvm/", "between-3500-kg-4500-kg-gvm/", "between-4500-kg-6000-kg-gvm/",
  "between-6000-kg-8000-kg-gvm/", "over-8000-kg-gvm/",
];
const LENGTH_PATHS = [
  "under-20-length-in-feet/", "between-20-23-length-in-feet/", "between-23-26-length-in-feet/",
  "between-26-30-length-in-feet/", "over-30-length-in-feet/",
];
const SLEEP_PATHS = [
  "2-people-sleeping-capacity/", "3-people-sleeping-capacity/", "4-people-sleeping-capacity/",
  "5-people-sleeping-capacity/", "over-5-people-sleeping-capacity/",
];
const STATE_SLUGS = [
  "victoria", "new-south-wales", "queensland",
  "south-australia", "western-australia", "tasmania",
];

function buildAttributesOthersPaths() {
  const paths = [...PRICE_PATHS, ...GVM_PATHS, ...LENGTH_PATHS, ...SLEEP_PATHS];
  for (const state of STATE_SLUGS) {
    const prefix = `${state}-state/`;
    for (const p of PRICE_PATHS)  paths.push(prefix + p);
    for (const p of GVM_PATHS)    paths.push(prefix + p);
    for (const p of LENGTH_PATHS) paths.push(prefix + p);
    for (const p of SLEEP_PATHS)  paths.push(prefix + p);
  }
  return paths;
}

async function main() {
  const urls = new Set();

  const results = await Promise.all(API_TYPES.map((t) => fetchType(t)));
  results.forEach((paths) => {
    for (const p of paths) urls.add(`${SITE_URL}/listings/${p}`);
  });

  for (const p of buildAttributesOthersPaths()) {
    urls.add(`${SITE_URL}/listings/${p}`);
  }

  if (urls.size === 0) {
    console.error("Fetched zero URLs from every type — not overwriting url.csv.");
    process.exit(1);
  }

  const sorted = Array.from(urls).sort();
  fs.writeFileSync(OUT_PATH, sorted.join("\n") + "\n", "utf-8");
  console.log(`Wrote ${sorted.length} URLs to ${OUT_PATH}`);
}

main();
