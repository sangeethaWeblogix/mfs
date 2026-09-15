import Image from "next/image";

export default function HomeBuyerGuide() {
  return (
    <>
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
                Motorhomes for Sale Australia: <span className="hbg-title-accent">Buyer Guide</span>
              </h2>
              
              <p className="hbg-body">
                MotorhomesForSale.com.au helps Australian buyers browse and compare new and used motorhomes in one convenient place. Review prices, layouts, features and key specifications before contacting a private seller or visiting a dealership. Compare important details such as year, make, model, sleeping capacity, length, fuel type, transmission, tare weight, GVM and payload capacity to narrow down the options that suit your needs.
              </p>
              <p className="hbg-body">
                Use the search filters to browse available motorhomes by state, location, price, condition, make, sleeping capacity and length. You can then compare standard features, optional upgrades, warranty coverage, finance options and trade-in availability before making your decision. When buying a used motorhome, also check its service history, registration status, overall condition and maintenance records. Our platform makes it easier to research available listings and find the right motorhome for your budget, travel plans and lifestyle.
              </p>
              
            </div>

          </div>
        </div>
      </section>

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
