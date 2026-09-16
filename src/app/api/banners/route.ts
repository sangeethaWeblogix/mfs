
// src/app/api/banners/route.ts
import { NextResponse } from "next/server";
import { fetchBanners } from "@/api/banners/api";

export async function GET() {
  try {
    const banners = await fetchBanners();
    console.log(`✅ Total banners: ${banners.length}`);
    return NextResponse.json(banners);
  } catch (error) {
    console.error("🔴 Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
