import { readObfuscatedBody } from "@/lib/obfuscation";
const API_KEY = process.env.MFS_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;

export async function POST(req: Request) {
  try {
    const { slug } = await readObfuscatedBody<{ slug?: string }>(req);
    if (!slug) return Response.json({ success: false });

    // GET hits a different, non-recording code path upstream — /click only
    // actually increments the counter when called with POST (confirmed
    // live: GET returns plain product JSON, POST returns
    // {success, click_count, unique_click_count}).
    const visitorIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";

    await fetch(`${API_BASE}/click?slug=${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: {
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
        ...(visitorIp && { "X-Forwarded-For": visitorIp, "X-Real-IP": visitorIp }),
        ...(userAgent && { "User-Agent": userAgent }),
      },
    });

    return Response.json({ success: true });
  } catch (_e) {
    return Response.json({ success: false });
  }
}
