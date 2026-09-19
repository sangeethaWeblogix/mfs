import { NextResponse } from "next/server";
import { fetchSitemapPaths, buildSitemapXml } from "@/lib/sitemapApi";

export async function GET() {
  const paths = await fetchSitemapPaths("listings");
  const sitemap = buildSitemapXml(paths, "product", "daily");

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
