const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.CFS_API_KEY; // ✅ Add this

export const fetchStateBasedCaravans = async () => {
  try {
    const res = await fetch(`${API_BASE}/state-based-motorhomes-list`, {
      // Short revalidate — if the backend is erroring, a failed/empty result
      // shouldn't stay cached for a full hour. Once it's healthy again this
      // lets production recover within ~a minute instead of needing a redeploy.
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
        ...(API_KEY && { "X-API-Key": API_KEY }),
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.states || [];
  } catch {
    return [];
  }
};
