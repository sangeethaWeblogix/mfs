import "./footer.css?=19";
import BackToTopButton from "./BackToTopButton";
import FooterNav from "./FooterNav";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="style-8">
        <div className="container">
          <div className="foot py-4  brd-gray">
            <div className="row">
              {/* Left Column */}
              <div className="col-lg-12">
                <h6 className="foot-title hidden-lg hidden-md hidden-sm foot_xs">Marketplace Network</h6>
                {/* FooterNav contains the nav ul + Sell dropdown panel as a sibling div */}
                <FooterNav />
                <div>
                  <p>
                    © {currentYear ?? "----"} Marketplace Network Pty Ltd (ABN 70 694 987 052)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* To Top Button */}
      <BackToTopButton />
    </>
  );
};

export default Footer;
