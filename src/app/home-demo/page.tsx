import Home from "./home";
import "../globals.css";
 import { fetchStateBasedCaravans } from "@/api/homeApi/state/api";
import { fetchRequirements } from "@/api/postRquirements/api";
import { fetchHomeFeatured } from "@/api/homeApi/featured/api";
import { fetchBlogs } from "@/api/blog/api";

export const revalidate = 86400;

const SEED_MAX = 15;

export default async function HomeDemoPage() {
  const seed = Math.floor(Math.random() * SEED_MAX) + 1;

  const [

    stateBands,
    requirements,
    featuredAll,
    featuredNew,
    featuredUsed,
    blog,
  ] = await Promise.all([

    fetchStateBasedCaravans(),
    fetchRequirements(),
    fetchHomeFeatured({ type: "all", seed }),
    fetchHomeFeatured({ type: "new", seed }),
    fetchHomeFeatured({ type: "used", seed }),
    fetchBlogs(1),
  ]);

  const featured = { all: featuredAll, new: featuredNew, used: featuredUsed };

  return (
    <Home

      stateBands={stateBands}
      requirements={requirements}
      featured={featured}
      blogPosts={blog.items}
    />
  );
}
