import Link from "next/link";
import "./not-found.css";
import Notfound from "./searchError";

export const metadata = {
  title: "404 - Page Not Found | Motorhomes For Sale",
  description: "The page you're looking for doesn't exist or has been moved. Browse our range of motorhomes for sale across Australia.",
  robots: "noindex, nofollow",
};

export default function NotFoundPage() {
  const states = [
    {
      name: "Australian Capital Territory",
      slug: "australian-capital-territory-state",
    },
    { name: "New South Wales", slug: "new-south-wales-state" },
    { name: "Northern Territory", slug: "northern-territory-state" },
    { name: "Queensland", slug: "queensland-state" },
    { name: "South Australia", slug: "south-australia-state" },
    { name: "Victoria", slug: "victoria-state" },
    { name: "Western Australia", slug: "western-australia-state" },
    { name: "Tasmania", slug: "tasmania-state" },
  ];

  return (
    <div className="page-wrap">
      <div className="card" role="main" aria-labelledby="page-title">
        <h1 id="page-title" className="err-number">
          404
        </h1>
        <p className="err-sub">
          Oops! The motorhome or page you’re looking for isn’t available.
        </p>

        <div className="search-wrap">
          <form action="/search" method="get" role="search">
            <Notfound />
          </form>
        </div>

        <div className="actions">
          <Link className="btn btn-primary" href="/">
            Go to Homepage
          </Link>
          <a className="btn btn-outline" href="/listings/">
            Browse Motorhomes
          </a>
        </div>

        <div className="browse-grid">
          <div className="browse-column">
            <h4>Browse by State</h4>
            <div className="browse-pills">
              {states.map((state) => (
                <a key={state.slug} href={`/listings/${state.slug}/`} className="browse-pill">
                  {state.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
