import { NextResponse } from "next/server";
import { encodeObfuscated, readObfuscatedBody } from "@/lib/obfuscation";

const API_KEY = process.env.CFS_API_KEY; // ✅ Added

function obf(data: unknown): NextResponse {
  return new NextResponse(encodeObfuscated(data), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  try {
    const { product_id } = await readObfuscatedBody(req);

    const ip = req.headers.get("x-forwarded-for") || "";
    const user_agent = req.headers.get("user-agent") || "";

    // 🔥 Call WordPress API from server (hidden)
    await fetch(
      "https://admin.motorhomesforsale.com.au/wp-json/mfs/v1/update-clicks",
      {
        method: "POST",
       headers: {
          "Content-Type": "application/json",
          ...(API_KEY && { "X-API-Key": API_KEY }), // ✅ Added
        },
        body: JSON.stringify({
          product_id,
          ip,
          user_agent,
        }),
      }
    );

    await fetch(
      "https://admin.motorhomesforsale.com.au/wp-json/mfs/v1/update-impressions",
      {
        method: "POST",
       headers: {
          "Content-Type": "application/json",
          ...(API_KEY && { "X-API-Key": API_KEY }), // ✅ Added
        },
        body: JSON.stringify({
          product_id,
          ip,
          user_agent,
        }),
      }
    );

    return obf({ success: true });
  } catch (e) {
    return obf({ error: true });
  }
}