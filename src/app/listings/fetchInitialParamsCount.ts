/** Server-side counterpart to StateFilterBar's initial combined
 * /api/d2/?group_by=make,condition,state fetch — called during SSR
 * so the make/state dropdown data lands in the initial render instead of a
 * client-visible request firing on every page load. */

const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.CFS_API_KEY;

export type InitialParamsCount = {
  make: { name: string; slug: string; count: number; model?: { name: string; slug: string; count: number }[] }[];
  state: { name: string; slug: string; count: number; region?: { name: string; slug: string; count: number }[] }[];
};

export async function fetchInitialParamsCount(): Promise<InitialParamsCount | null> {
  try {
    const res = await fetch(`${API_BASE}/params_count?group_by=make,condition,state`, {
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
      },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const raw = await res.text();
    const idx = raw.indexOf('{"');
    const json = JSON.parse(idx > 0 ? raw.substring(idx) : raw);
    const data = json?.data;
    if (!data) return null;

    return { make: data.make ?? [], state: data.state ?? [] };
  } catch {
    return null;
  }
}
