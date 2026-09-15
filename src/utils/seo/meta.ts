 import { parseSlugToFilters } from "@/app/components/urlBuilder";
import type { Metadata } from "next";
import { INDEXABLE_URLS } from "./indexable-urls";
export { isAllowedSingleBand } from "./band-utils";

// ─── Title generation from parsed filters (no API call needed) ───
const STATE_NAMES: Record<string, string> = {
  "victoria": "Victoria",
  "new-south-wales": "New South Wales",
  "queensland": "Queensland",
  "south-australia": "South Australia",
  "western-australia": "Western Australia",
  "tasmania": "Tasmania",
  "northern-territory": "Northern Territory",
  "australian-capital-territory": "Australian Capital Territory",
};

function titleCase(s: string): string {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtPrice(n: string): string {
  return `$${parseInt(n, 10).toLocaleString("en-AU")}`;
}

function fmtKg(n: string): string {
  return `${parseInt(n, 10).toLocaleString("en-AU")}kg`;
}

function getBandText(parsed: ReturnType<typeof parseSlugToFilters>): string {
  //GVM (weight)
  const minKg = parsed.minKg ? String(parsed.minKg) : null;
  const maxKg = parsed.maxKg ? String(parsed.maxKg) : null;
  let gvmPart = "";
  if (minKg && maxKg) gvmPart = `${fmtKg(minKg)} - ${fmtKg(maxKg)}GVM`;
  else if (maxKg)     gvmPart = `Under ${fmtKg(maxKg)}GVM`;
  else if (minKg)     gvmPart = `Over ${fmtKg(minKg)}GVM`;

  // Price
  const from = parsed.from_price ? String(parsed.from_price) : null;
  const to   = parsed.to_price   ? String(parsed.to_price)   : null;
  let pricePart = "";
  if (from && to) pricePart = `${fmtPrice(from)} - ${fmtPrice(to)}`;
  else if (to)    pricePart = `Under ${fmtPrice(to)}`;
  else if (from)  pricePart = `Over ${fmtPrice(from)}`;

  // Sleep (berths)
  const fromSleep = parsed.from_sleep ? String(parsed.from_sleep) : null;
  const toSleep   = parsed.to_sleep   ? String(parsed.to_sleep)   : null;
  let sleepPart = "";
  if (fromSleep && toSleep) sleepPart = `Sleeping ${fromSleep}-${toSleep} Berths`;
  else if (toSleep)         sleepPart = `Sleeping Up to ${toSleep} Berths`;
  else if (fromSleep)       sleepPart = `Sleeping ${fromSleep}+ Berths`;

  // Length (feet)
  const fromLen = parsed.from_length ? String(parsed.from_length) : null;
  const toLen   = parsed.to_length   ? String(parsed.to_length)   : null;
  let lengthPart = "";
  if (fromLen && toLen) lengthPart = `${fromLen}ft - ${toLen}ft`;
  else if (toLen)       lengthPart = `Under ${toLen}ft`;
  else if (fromLen)     lengthPart = `Over ${fromLen}ft`;

  // Combine all parts —GVM before price, matching API seo_v2.h1 format
  return [gvmPart, pricePart, sleepPart, lengthPart].filter(Boolean).join(" ");
}

export function generateTitleFromFilters(
  parsed: ReturnType<typeof parseSlugToFilters>
): string {
  // Build location suffix (shared)
  const locationSuffix = parsed.state
    ? (() => {
        const sk = parsed.state.toLowerCase().replace(/\s+/g, "-");
        const sn = STATE_NAMES[sk] ?? titleCase(parsed.state);
        return parsed.region
          ? ` in ${titleCase(parsed.region)}, ${sn}`
          : ` in ${sn}, Australia`;
      })()
    : " in Australia";

  // Keyword search: treat search term as the primary noun
  if (parsed.search) {
    const kw = titleCase(parsed.search);
    const noun = /caravans?$/i.test(kw) ? kw : `${kw} Motorhomes`;
    return `${noun} for Sale${locationSuffix}`;
  }

  const parts: string[] = [];

  // Year prefix
  if (parsed.acustom_fromyears) parts.push(String(parsed.acustom_fromyears));

  if (parsed.condition === "New" || parsed.condition === "new") parts.push("New");
  else if (parsed.condition === "Used" || parsed.condition === "used") parts.push("Used");

  if (parsed.make) parts.push(titleCase(parsed.make));
  if (parsed.model) parts.push(titleCase(parsed.model));
  if (parsed.category) parts.push(titleCase(parsed.category));

  const baseNoun = parts.length > 0 ? `${parts.join(" ")} Motorhomes` : "Motorhomes";
  const band = getBandText(parsed);
  const bandPart = band ? ` ${band}` : "";

  return `${baseNoun} for Sale${bandPart}${locationSuffix}`;
}

export async function metaFromSlug(
  filters: string[] = [],
  searchParams: Record<string, string | string[] | undefined> = {}
): Promise<Metadata> {
   const BASE_URL = "https://www.motorhomesforsale.com.au";

  const parsed = parseSlugToFilters(filters, searchParams);

  const slugPath = filters.length > 0 ? filters.join("/") : "";
  const canonicalUrl = `${BASE_URL}/listings/${slugPath ? slugPath + "/" : ""}`;
  const urlPath = `/listings/${slugPath ? slugPath + "/" : ""}`;
  const robotsResult = { index: INDEXABLE_URLS.has(urlPath) };

  // ── suburb canonical fix ──
  let canonical = canonicalUrl;
  if (parsed.suburb) {
    const locationSegments = filters.filter(
      (seg) =>
        seg.endsWith("-state") ||
        seg.endsWith("-region") ||
        seg.endsWith("-suburb")
    );
    canonical = `${BASE_URL}/listings/${locationSegments.join("/")}/`;
  }

  // ── keyword combination canonical fix ──
  // For /listings/victoria-state/.../keyword-search/ → canonical = /listings/keyword-search/
  const searchSeg = (parsed.search ?? parsed.keyword)
    ? filters.find((seg) => seg.endsWith("-search"))
    : null;
  if (searchSeg && !robotsResult.index) {
    canonical = `${BASE_URL}/listings/${searchSeg}/`;
  }

  // Append searchParams (except page=1 and shuffle_seed)
  const spEntries = Object.entries(searchParams).filter(([k, v]) => {
    if (k === "page" && String(v) === "1") return false;
    if (k === "shuffle_seed") return false;
    return true;
  });
  if (spEntries.length > 0) {
    const qs = spEntries
      .map(([k, v]) => `${k}=${Array.isArray(v) ? v[0] : v}`)
      .join("&");
    canonical += `?${qs}`;
  }

  const title = generateTitleFromFilters(parsed);
  const description =
    "Browse new and used motorhomes for sale across Australia. Compare prices, layouts, sleeping capacity and key specifications from dealers and private sellers.";

  return {
    title: { absolute: title },
    description,
    robots: { index: robotsResult.index },
    alternates: { canonical, languages: {}, media: {} },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [
        {
          url: "https://www.motorhomesforsale.com.au/images/mfs-logo.png",
          width: 800,
          height: 600,
          alt: "Motorhomes for Sale Australia",
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}