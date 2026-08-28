import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollTo = (id) => {
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="site-footer py-5" aria-label="Site Footer">
      <div className="container">
        <div className="row g-4 justify-content-between">
          {/* Brand Col */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-3">
              <span className="brand-mark-circle" aria-hidden="true">
                B
              </span>
              <div className="brand-copy">
                <strong className="footer-brand-name">Butter Freight</strong>
                <small className="footer-brand-tagline">Intelligent bulk chartering</small>
              </div>
            </Link>
            <p className="footer-desc mb-3">
              AI-assisted freight rate forecasting, vessel optimization, and port infrastructure intelligence for bulk cargo transportation to India’s East Coast.
            </p>
            <div className="d-flex align-items-center gap-2">
              <span className="footer-badge badge rounded-pill">
                ✦ Multi-Horizon XGBoost + SARIMA
              </span>
            </div>
          </div>

          {/* Explore Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="footer-heading">Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => { e.preventDefault(); handleScrollTo("features"); }}
                  className="footer-link"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  onClick={(e) => { e.preventDefault(); handleScrollTo("workflow"); }}
                  className="footer-link"
                >
                  Solutions
                </a>
              </li>
              <li>
                <Link to="/forecast_query" className="footer-link">
                  Decision Cockpit
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="footer-heading">Company</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/about" className="footer-link">
                  About Us
                </Link>
              </li>
              <li>
                <a href="mailto:hello@butterfreight.com" className="footer-link">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  Our Mission
                </Link>
              </li>
              <li>
                <a href="mailto:support@butterfreight.com" className="footer-link">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Operational Coverage */}
          <div className="col-lg-3 col-md-6">
            <h6 className="footer-heading">Coverage</h6>
            <p className="footer-desc mb-2">
              7 Indian East Coast Ports: Paradip, Visakhapatnam, Gangavaram, Gopalpur, Dhamra, Haldia, Sagar.
            </p>
            <p className="footer-desc mb-0" style={{ fontSize: "0.8rem", color: "#8da197" }}>
              Loading Origins: Australia, US, Mozambique, Russia, Indonesia.
            </p>
            <div className="d-flex gap-3 mt-3">
              <span className="footer-meta-link" style={{ color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer" }}>Privacy</span>
              <span style={{ color: "#64748b" }}>•</span>
              <span className="footer-meta-link" style={{ color: "#94a3b8", fontSize: "0.8rem", cursor: "pointer" }}>Terms</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="footer-bottom d-flex justify-content-between align-items-center flex-wrap gap-2 pt-4 mt-4 border-top">
          <small>
            © 2026 Butter Freight • Intelligent Freight Forecasting & Vessel Chartering System. All rights reserved.
          </small>
          <span className="footer-accent-text">
            ✦ Built for Bulk Logistics Decision Intelligence
          </span>
        </div>
      </div>
    </footer>
  );
}
