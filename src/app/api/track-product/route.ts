import { NextResponse } from "next/server";
import { readObfuscatedBody } from "@/lib/obfuscation";
const API_KEY = process.env.MFS_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;

export async function POST(req: Request) {
  try {
    const { slug } = await readObfuscatedBody<{ slug?: string }>(req);
    if (!slug) return NextResponse.json({ success: false });

    // GET requests to /click and /impression silently hit a different,
    // non-recording code path upstream (it just echoes back the product
    // detail JSON — an nginx proxy cache also serves those from cache on
    // repeat calls, but that's a symptom, not the cause). Both endpoints
    // must be called with POST to actually reach the counter-incrementing
    // handler — confirmed live: GET returns plain product JSON, POST
    // returns {success, click_count, unique_click_count}.
    //
    // Also forward the real visitor's IP/UA — this route calls WP
    // server-side, so without this WP would attribute every click to our
    // own server's IP/UA instead of the real visitor's.
    const visitorIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";

    const headers = {
      ...(API_KEY && { "X-Secret-Key": API_KEY }),
      ...(visitorIp && { "X-Forwarded-For": visitorIp, "X-Real-IP": visitorIp }),
      ...(userAgent && { "User-Agent": userAgent }),
    };

    await Promise.all([
      fetch(`${API_BASE}/click?slug=${encodeURIComponent(slug)}`, { method: "POST", headers }),
      fetch(`${API_BASE}/impression?slug=${encodeURIComponent(slug)}`, { method: "POST", headers }),
    ]);

    return NextResponse.json({ success: true });
  } catch (_e) {
    return NextResponse.json({ error: true });
  }
}
