import Image from "next/image";
import HomeFaq from "./HomeFaq";
import { buildHomeFaqJsonLd } from "./homeFaqData";

export default function HomeBuyerGuide() {
  const faqJsonLd = buildHomeFaqJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ── Buyer Guide ── */}
      <section className="hbg-section">
        <div className="container">
          <div className="hbg-row">

            {/* Left: Image */}
            <div className="hbg-img-col">
              <div className="hbg-img-wrap">
                <Image
                  src="/images/buyers_guid.jpg"
                  alt="Motorhomes for Sale Australia"
                  width={600}
                  height={420}
                  className="hbg-img"
                  unoptimized
                />
                <div className="hbg-badge">
                  <svg className="hbg-badge-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <span className="hbg-badge-text">AUSTRALIA&apos;S TRUSTED<br />MOTORHOME MARKETPLACE</span>
                </div>
              </div>
            </div>

            {/* Right: Text */}
            <div className="hbg-text-col">
              <h2 className="hbg-title">
                Motorhomes for Sale in Australia <span className="hbg-title-accent">– Buy with Confidence</span>
              </h2>

              <p className="hbg-body">
                Looking to buy a motorhome in Australia? MotorhomesForSale.com.au helps you browse and compare new and used motorhomes for sale from dealerships and private sellers nationwide. Whether you&apos;re buying your first motorhome, upgrading or searching for an affordable second-hand model, find a vehicle that suits your budget and travel plans.
              </p>
              <p className="hbg-body">
                Explore motorhomes from popular brands such as Jayco, Avida, Sunliner, Winnebago, Avan, Trakka and KEA. From compact 2-berth motorhomes for couples to spacious family models, luxury tourers and 4WD motorhomes, compare layouts featuring island beds, twin beds, rear lounges, bunk beds and ensuites.
              </p>
              <p className="hbg-body">
                Use our search filters to find motorhomes by location, price, condition, make, sleeping capacity and length. Compare key specifications including year, kilometres travelled, fuel type, transmission, GVM and payload capacity, along with features such as solar panels, air conditioning and kitchen facilities.
              </p>
              <p className="hbg-body">
                When buying a used motorhome, check its service history, mechanical condition, registration and signs of water damage. Whether you&apos;re planning weekend getaways or travelling around Australia, browse our{" "}
                <a href="/listings/" className="hbg-sell-link">motorhomes for sale</a>, compare available listings and contact dealers or private sellers directly.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* ── Explore Other Travel Options ── */}
      <section className="hbg-section hbg-explore-section">
        <div className="container">
          <h2 className="hbg-title">Explore Other Travel Options</h2>
          <p className="hbg-body">
            Not sure a motorhome is right for you? Take a look at{" "}
            <a href="https://www.caravansforsale.com.au/" className="hbg-sell-link" target="_blank" rel="noopener noreferrer">caravans for sale</a>,{" "}
            browse{" "}
            <a href="https://www.campervansforsale.au/" className="hbg-sell-link" target="_blank" rel="noopener noreferrer">campervans for sale</a>{" "}
            if you want something smaller, or compare{" "}
            <a href="https://www.campingtrailersforsale.com.au/" className="hbg-sell-link" target="_blank" rel="noopener noreferrer">camper trailers for sale</a>{" "}
            for your next camping trip. You&apos;ll find these on our other marketplaces.
          </p>
        </div>
      </section>

      <HomeFaq />

      {/* ── Sell CTA Card ── */}
      <section className="hbg-sell-section">
        <div className="container">
          <div className="hbg-sell-card">

            {/* Icon row */}
            <div className="hbg-sell-icon-row">
              <span className="hbg-sell-line" />
              <div className="hbg-sell-icon-wrap">
                <Image src="/images/category.svg" alt="" width={24} height={24} style={{ opacity: 0.4 }} />
              </div>
              <span className="hbg-sell-line" />
            </div>

            <h2 className="hbg-sell-title">Looking to Sell Your Motorhome?</h2>
            <p className="hbg-sell-body">
              If you&apos;re upgrading or no longer need your current motorhome,{" "}
              <a href="/sell-my-motorhome/" className="hbg-sell-link">sell your motorhome</a>{" "}
              by creating a listing on MotorhomesForSale.com.au and connect with active buyers across Australia. Your advertisement stays online until it&apos;s sold for a one-time fee of $49.
            </p>


          </div>
        </div>
      </section>

      {/* ── Why Australians ── */}
      <section className="hbg-why-section">
        <div className="container">
          <h2 className="hbg-why-title">
            Why Australians Use <span className="hbg-why-accent">MotorhomesForSale.com.au</span>
          </h2>
          

          <div className="hbg-why-cards-wrap">
            <div className="hbg-why-grid">

              <div className="hbg-why-card">
                <div className="hbg-why-icon">
                  <Image src="/images/seller.svg" alt="Dealers & Private Sellers" width={34} height={34} />
                </div>
                <h3 className="hbg-why-card-title">Dealers &amp; Private Sellers</h3>
                <div className="hbg-why-card-sep" />
                <p className="hbg-why-card-desc">Browse new and used motorhomes for sale from trusted dealers and private sellers across Australia.</p>
              </div>

              <div className="hbg-why-card">
                <div className="hbg-why-icon">
                  <Image src="/images/australia.png" alt="Australia-Wide Coverage" width={34} height={34} />
                </div>
                <h3 className="hbg-why-card-title">Australia-Wide Coverage</h3>
                <div className="hbg-why-card-sep" />
                <p className="hbg-why-card-desc">Browse listings from all states and territories and find motorhomes near you.</p>
              </div>

              <div className="hbg-why-card">
                <div className="hbg-why-icon">
                  <Image src="/images/category.svg" alt="Motorhome-Specific Marketplace" width={34} height={34} />
                </div>
                <h3 className="hbg-why-card-title">Motorhome-Specific Marketplace</h3>
                <div className="hbg-why-card-sep" />
                <p className="hbg-why-card-desc">A focused marketplace dedicated to motorhomes and motorhome buyers.</p>
              </div>

              <div className="hbg-why-card">
                <div className="hbg-why-icon">
                  <Image src="/images/dollar.png" alt="Easy to Compare" width={34} height={34} />
                </div>
                <h3 className="hbg-why-card-title">Easy to Compare</h3>
                <div className="hbg-why-card-sep" />
                <p className="hbg-why-card-desc">Compare motorhome prices, layouts and specifications side by side to find the right fit.</p>
              </div>

            </div>
          </div>

          
        </div>
      </section>
    </>
  );
}
