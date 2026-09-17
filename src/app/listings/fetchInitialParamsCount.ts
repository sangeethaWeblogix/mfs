/** Server-side counterpart to StateFilterBar's initial combined
 * /api/d2/?group_by=make,condition,state fetch — called during SSR
 * so the make/state dropdown data lands in the initial render instead of a
 * client-visible request firing on every page load. */

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.MFS_API_KEY;

export type InitialParamsCount = {
  make: { name: string; slug: string; count: number; model?: { name: string; slug: string; count: number }[] }[];
  state: { name: string; slug: string; count: number; region?: { name: string; slug: string; count: number }[] }[];
};

// The live WP endpoint (params-count, hyphenated) only accepts a single
// group_by value per call — "make,condition,state" 400s with "Invalid
// group_by value" — so make and state are fetched separately and merged.
async function fetchGroupBy(groupBy: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/params-count?group_by=${groupBy}`, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
      },
      cache: "no-store",
    });
    if (!res.ok) return [];

    const raw = await res.text();
    const idx = raw.indexOf('{"');
    const json = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export async function fetchInitialParamsCount(): Promise<InitialParamsCount | null> {
  const [make, state] = await Promise.all([fetchGroupBy("make"), fetchGroupBy("state")]);
  if (!make.length && !state.length) return null;
  return { make, state };
}
