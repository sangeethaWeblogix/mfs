import { encodeObfuscated, readObfuscatedBody } from "@/lib/obfuscation";

const API_KEY = process.env.CFS_API_KEY; // ✅ Added

function obf(data: unknown): Response {
  return new Response(encodeObfuscated(data), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  try {
    const body = await readObfuscatedBody(req);

    // ✅ Get user IP from headers
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const user_agent = req.headers.get("user-agent") || "";
  console.log("IP:", ip);
  console.log("IPUA:", user_agent);
    // 🔥 Your existing API call (move here)
    await fetch(
      "https://admin.motorhomesforsale.com.au/wp-json/mfs/v1/update-impressions",
      {
        method: "POST",
         headers: {
          "Content-Type": "application/json",
          ...(API_KEY && { "X-API-Key": API_KEY }), // ✅ Added
        },
        body: JSON.stringify({
          product_id: body.product_id,
          ip,
          user_agent,
        }),
      }
    );

    return obf({ success: true });
  } catch (_e) {
    return obf({ success: false });
  }
}