import { readObfuscatedBody } from "@/lib/obfuscation";
const API_KEY = process.env.MFS_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;

export async function POST(req: Request) {
  try {
    const { slug } = await readObfuscatedBody<{ slug?: string }>(req);
    if (!slug) return Response.json({ success: false });

    await fetch(`${API_BASE}/click?slug=${encodeURIComponent(slug)}`, {
      headers: {
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
      },
    });

    return Response.json({ success: true });
  } catch (_e) {
    return Response.json({ success: false });
  }
}
