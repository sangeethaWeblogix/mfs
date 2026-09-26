import { NextResponse } from "next/server";
import { readObfuscatedBody } from "@/lib/obfuscation";

const API_KEY = process.env.MFS_API_KEY;
const API_BASE = process.env.NEXT_PUBLIC_MFS_API_BASE;

/**
 * Listing-card impression tracker — fired by StateListingGrid's
 * IntersectionObserver when a card scrolls 30% into view. Same backend call
 * as /api/track/, just reading the client's obfuscated body instead of plain
 * JSON (this route's client-visible name/payload shouldn't reveal which
 * product was viewed).
 */
export async function POST(req: Request) {
  try {
    const { slug } = await readObfuscatedBody<{ slug?: string }>(req);
    if (!slug) return NextResponse.json({ success: false });

    // GET hits a different, non-recording code path upstream — /impression
    // only actually increments the counter when called with POST (confirmed
    // live: GET returns plain product JSON, POST returns
    // {success, click_count, unique_click_count}).
    const visitorIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";

    await fetch(`${API_BASE}/impression?slug=${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: {
        ...(API_KEY && { "X-Secret-Key": API_KEY }),
        ...(visitorIp && { "X-Forwarded-For": visitorIp, "X-Real-IP": visitorIp }),
        ...(userAgent && { "User-Agent": userAgent }),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
