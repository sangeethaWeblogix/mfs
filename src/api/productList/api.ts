const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY  = process.env.CFS_API_KEY;

/** Shared headers for every WP API call. */
const wpHeaders = (): Record<string, string> => ({
  Accept: "application/json",
  ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
});

// ---------------------------------------------------------------------------
// fetchModelCounts
// ---------------------------------------------------------------------------
export const fetchModelCounts = async (
  make: string
): Promise<{ name: string; slug: string; count: number }[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(
      `${API_BASE}/params_count?group_by=model&make=${encodeURIComponent(make)}`,
      {
        headers: wpHeaders(),
        next: { revalidate: 3600 },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data ?? [];
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
};

/** Remove duplicate makes by slug (WP taxonomy can register the same make twice). */
function dedupBySlug<T extends { slug: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  return arr.filter((m) => {
    if (seen.has(m.slug)) return false;
    seen.add(m.slug);
    return true;
  });
}

// ---------------------------------------------------------------------------
// fetchMakeCounts
// ---------------------------------------------------------------------------
export const fetchMakeCounts = async (): Promise<
  { name: string; slug: string; count: number }[]
> => {
  try {
    const res = await fetch(`${API_BASE}/params_count?group_by=make`, {
      headers: wpHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return dedupBySlug(data?.data ?? []);
  } catch {
    return [];
  }
};

// ---------------------------------------------------------------------------
// fetchCategoryCounts
// ---------------------------------------------------------------------------
export const fetchCategoryCounts = async (): Promise<
  { name: string; slug: string; count: number }[]
> => {
  try {
    const res = await fetch(`${API_BASE}/params_count?group_by=category`, {
      headers: wpHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data ?? []).map(
      (c: { name: string; slug: string; count: number }) => ({
        ...c,
        slug: c.slug.replace(/-category$/, ""),
      })
    );
  } catch {
    return [];
  }
};

// ---------------------------------------------------------------------------
// fetchProductList — Next.js 1h fetch cache.
// ---------------------------------------------------------------------------
export const fetchProductList = async () => {
  try {
    const res = await fetch(`${API_BASE}/params-product-list`, {
      headers: wpHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch product list");
    return await res.json();
  } catch (error) {
    console.error("fetchProductList error:", error);
    return null;
  }
};
