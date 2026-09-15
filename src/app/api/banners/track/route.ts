import { NextResponse } from "next/server";
import { encodeObfuscated, readObfuscatedBody } from "@/lib/obfuscation";

function obf(data: unknown): NextResponse {
  return new NextResponse(encodeObfuscated(data), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  try {
    const body = await readObfuscatedBody(req);

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const user_agent = req.headers.get("user-agent") || "";

    await fetch(
      "https://admin.motorhomesforsale.com.au/wp-json/ads-manager/v1/banners/track",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banner_id: body.banner_id,
          event_type: body.event_type,
          session_id: body.session_id,
          page_url: body.page_url,
          device_type: body.device_type,
          user_agent,
          ip_address: ip,
        }),
      },
    );

    return obf({ success: true });
  } catch (_e) {
    return obf({ success: false });
  }
}
