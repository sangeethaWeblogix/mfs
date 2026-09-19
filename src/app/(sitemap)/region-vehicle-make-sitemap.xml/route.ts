import { NextResponse } from "next/server";
import { fetchSitemapPaths, buildSitemapXml } from "@/lib/sitemapApi";

export async function GET() {
  const paths = await fetchSitemapPaths("region-vehicle-make");
  const sitemap = buildSitemapXml(paths, "listings");

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
