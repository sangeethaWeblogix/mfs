// Edge-runtime-safe: no fs, path, or process.cwd() — middleware can't read
// src/app/url.csv (INDEXABLE_URLS) directly for the same reason, so these
// lists are kept in sync with it by hand. They must exactly match
// scripts/regenerate-url-csv.mjs's PRICE_PATHS/GVM_PATHS/LENGTH_PATHS/
// SLEEP_PATHS (the actual bands curated into url.csv and
// attributes-others-sitemap.xml) — a prior mismatch here (finer-grained
// bands than what's actually curated) made middleware's X-Robots-Tag header
// say noindex on 238 pages that url.csv/the sitemap/the page's own <meta
// robots> all correctly marked indexable (confirmed live via Ahrefs'
// "Noindex page in sitemap" report).

export const PRICE_BANDS_ORDERED = [
  "under-50000",
  "under-75000",
  "under-100000",
  "under-150000",
  "under-200000",
  "between-50000-75000",
  "between-75000-100000",
  "between-100000-150000",
  "between-150000-200000",
  "between-200000-300000",
  "over-200000",
  "over-300000",
];

export const GVM_BANDS_ORDERED = [
  "under-3500-kg-gvm",
  "between-3500-kg-4500-kg-gvm",
  "between-4500-kg-6000-kg-gvm",
  "between-6000-kg-8000-kg-gvm",
  "over-8000-kg-gvm",
];

export const SLEEP_BANDS_ORDERED = [
  "2-people-sleeping-capacity",
  "3-people-sleeping-capacity",
  "4-people-sleeping-capacity",
  "5-people-sleeping-capacity",
  "over-5-people-sleeping-capacity",
];

export const LENGTH_BANDS_ORDERED = [
  "under-20-length-in-feet",
  "between-20-23-length-in-feet",
  "between-23-26-length-in-feet",
  "between-26-30-length-in-feet",
  "over-30-length-in-feet",
];

// Still exported for attributes-others-sitemap.xml / the regenerate script's
// own curated band set — but isAllowedSingleBand below no longer restricts
// to just these. The backend's own /sitemap/price, /sitemap/gvm and
// /sitemap/length endpoints generate a much finer-grained set of bands
// (e.g. "between-70000-80000", confirmed live) that are deliberately kept in
// url.csv and given their own sitemaps (prices-sitemap.xml/weights-sitemap.xml/
// length-sitemap.xml) — matching against only the curated subset here noindexed
// those real, already-indexable (one even already ranking with organic
// traffic) pages. Sleeping capacity has no such live backend sitemap, so it
// stays matched against the curated set only.
export const ALLOWED_PRICE_BANDS  = new Set(PRICE_BANDS_ORDERED);
export const ALLOWED_GVM_BANDS    = new Set(GVM_BANDS_ORDERED);
export const ALLOWED_SLEEP_BANDS  = new Set(SLEEP_BANDS_ORDERED);
export const ALLOWED_LENGTH_BANDS = new Set(LENGTH_BANDS_ORDERED);

function isWellFormedGvmBand(s: string): boolean {
  return /^(under|over)-\d+-kg-gvm$/.test(s) || /^between-\d+-kg-\d+-kg-gvm$/.test(s);
}

function isWellFormedLengthBand(s: string): boolean {
  return /^(under|over)-\d+-length-in-feet$/.test(s) || /^between-\d+-\d+-length-in-feet$/.test(s);
}

export function isAllowedSingleBand(slugSegments: string[]): boolean {
  const price  = slugSegments.find(s => /^(under|over)-\d+$/.test(s) || /^between-\d+-\d+$/.test(s));
  const gvm    = slugSegments.find(s => s.includes("-kg-gvm"));
  const sleep  = slugSegments.find(s => s.includes("-people-sleeping-capacity"));
  const length = slugSegments.find(s => s.includes("-length-in-feet"));
  // price's find() predicate above already fully validates its shape.
  if (price)  return true;
  if (gvm)    return isWellFormedGvmBand(gvm);
  if (sleep)  return ALLOWED_SLEEP_BANDS.has(sleep);
  if (length) return isWellFormedLengthBand(length);
  return false;
}
