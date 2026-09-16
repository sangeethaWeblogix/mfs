// Cloudflare KV isn't wired up in this app yet — no account/namespace/token
// is configured anywhere in this repo, only the cfs-params-cache-warmer.php
// job that presumably writes to it. Every read below returns null so callers
// fall through to their existing live WP API fallback path.

export type ParamsCountKvResult = {
  data: any;
  total_products?: number;
  [key: string]: any;
};

export async function fetchParamsCountFromKV(
  _params: Record<string, any>
): Promise<ParamsCountKvResult | null> {
  return null;
}

export function buildParamsKvKey(params: Record<string, any>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `params-count:${sorted}`;
}

export function normalizeCountItems<
  T = { name: string; slug: string; count: number }
>(items: any[]): T[] {
  return (items ?? []).map((item) => {
    const normalized: any = {
      ...item,
      name: item.name ?? item.title ?? "",
      slug: item.slug ?? "",
      count: Number(item.count ?? item.total ?? 0),
    };
    if (Array.isArray(item.model)) normalized.model = normalizeCountItems(item.model);
    if (Array.isArray(item.region)) normalized.region = normalizeCountItems(item.region);
    return normalized as T;
  });
}
