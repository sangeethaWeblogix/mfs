import { NextResponse } from "next/server";
import { readObfuscatedBody } from "@/lib/obfuscation";

const ADS_API_BASE = "https://admin.marketplacenetwork.com.au/wp-json/ads-manager/v1";

/**
 * Banner impression/click tracker — useBannerTracking posts an obfuscated
 * body here (banner_id, event_type, session_id, page_url, device_type) and
 * this forwards it as JSON to the real ads-manager endpoint. This route
 * never existed, so every banner impression/click was silently 404ing.
 */
export async function POST(req: Request) {
  try {
    const body = await readObfuscatedBody<{
      banner_id?: number;
      event_type?: string;
      session_id?: string;
      page_url?: string;
      device_type?: string;
    }>(req);

    if (!body.banner_id || !body.event_type || !body.session_id) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    await fetch(`${ADS_API_BASE}/banners/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
