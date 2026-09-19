import { NextResponse } from "next/server";
import { fetchSitemapPaths, buildSitemapXml } from "@/lib/sitemapApi";

export async function GET() {
  const paths = await fetchSitemapPaths("states");
  const sitemap = buildSitemapXml(paths, "listings", "monthly", "0.8");

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
