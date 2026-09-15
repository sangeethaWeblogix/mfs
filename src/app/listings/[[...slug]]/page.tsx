import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import StateHome from "../home";
import { parseDemoFilters, buildListingsSlug } from "../urlUtils";
import { metaFromSlug } from "@/utils/seo/meta";
import { fetchBrowseSectionData } from "../fetchBrowseSectionData";
import { fetchInitialPool, fetchConditionSeo } from "../fetchInitialPool";
import { fetchInitialParamsCount } from "../fetchInitialParamsCount";
import "../../globals.css";

// Rendered fresh on every request (no ISR cache) — the shuffled product order
// and the make/state counts must be live per visit, and none of it should
// require a client-visible follow-up fetch (see fetchInitialPool's displaySeed
// and fetchInitialParamsCount for how each piece is produced server-side).
export const dynamic = "force-dynamic";

const SEED_MAX = 15;

// Cache the indexed-URL set for the lifetime of this server instance
// (same approach as /api/d3/route.ts — read once, never re-read).
let _indexedPaths: Set<string> | null = null;
function isPathIndexed(urlPath: string): boolean {
  if (!_indexedPaths) {
    const csvPath = path.join(process.cwd(), "src", "app", "url.csv");
    const raw = fs.readFileSync(csvPath, "utf-8");
    const set = new Set<string>();
    // One URL per line — no header row, no tab-separated columns.
    for (const line of raw.split("\n")) {
      const u = line.trim();
      if (u) set.add(u.replace(/^https?:\/\/[^/]+/, "").trim().toLowerCase().replace(/\/+$/, ""));
    }
    _indexedPaths = set;
  }
  const normalized = urlPath.trim().toLowerCase().replace(/\/+$/, "");
  return _indexedPaths.has(normalized);
}

type Params = Promise<{ slug?: string[] }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const slugArr = slug ?? [];
  const meta = await metaFromSlug(slugArr, query);
  return slugArr.length === 0 ? meta : { title: meta.title };
}

export default async function LocationStateDemoPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const initialFilters = parseDemoFilters(slug ?? [], query);
  console.log("[listings/[[...slug]]/page.tsx] slug:", slug, "query:", query, "initialFilters:", initialFilters);

  // Determine isIndexed server-side so fetchInitialPool buckets products
  // correctly (featured/new/used split vs combined grid) from the first byte.
  // Without this, SSR always uses isIndexed=true and the client-side
  // /api/d3/ check then triggers a second pool fetch to fix the layout.
  const canonicalPath = buildListingsSlug(initialFilters);
  const isIndexed = isPathIndexed(canonicalPath);

  // shuffle_seed is injected by the HTML cache warmer (e.g. ?shuffle_seed=3) so
  // each KV HTML variant gets a genuinely different product pool from WordPress.
  // 0 for a normal live request — the API call itself goes through the
  // CF-cached path; freshness for those requests comes from displaySeed below.
  const shuffleSeed = typeof query.shuffle_seed === "string"
    ? (parseInt(query.shuffle_seed, 10) || 0)
    : 0;

  // Local-only re-shuffle seed, fresh per request — reproduces the "different
  // order every visit" behavior that used to require a client-side re-fetch.
  const displaySeed = Math.floor(Math.random() * SEED_MAX) + 1;

  const [browseData, initialPool, initialParamsCount, newSeo, usedSeo] = await Promise.all([
    fetchBrowseSectionData(initialFilters),
    fetchInitialPool(initialFilters, isIndexed, shuffleSeed, displaySeed),
    fetchInitialParamsCount(),
    isIndexed ? fetchConditionSeo(initialFilters, "New", shuffleSeed) : Promise.resolve(null),
    isIndexed ? fetchConditionSeo(initialFilters, "Used", shuffleSeed) : Promise.resolve(null),
  ]);

  return (
    <StateHome
      initialFilters={initialFilters}
      browseData={browseData}
      initialPool={initialPool}
      serverIsIndexed={isIndexed}
      initialParamsCount={initialParamsCount}
      initialNewSeo={newSeo}
      initialUsedSeo={usedSeo}
    />
  );
}
