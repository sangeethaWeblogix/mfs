// Mulberry32 PRNG — deterministic, fast, well-distributed.
// Shared by the server-side initial pool fetch (fetchInitialPool.ts) and the
// client-side live re-fetch (home.tsx) so both produce the exact same
// re-shuffled order for a given seed.
function mulberry32(seed: number) {
  return () => {
    seed += 0x6D2B79F5;
    let t = seed ^ (seed >>> 15);
    t = Math.imul(t, 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  if (arr.length <= 1) return arr;
  const out = [...arr];
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
