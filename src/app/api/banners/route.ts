
// src/app/api/banners/route.ts
import { NextResponse } from "next/server";
import { fetchBanners } from "@/api/banners/api";

export async function GET() {
  const banners = await fetchBanners();
  console.log(`✅ Total banners: ${banners.length}`);
  return NextResponse.json(banners);
}
