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
    <footer
      className="site-footer py-5"
      style={{
        backgroundColor: "#071b1e",
        borderTop: "1px solid #14383c",
        color: "#cbd5e1",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div className="container">
        <div className="row g-4 justify-content-between">
          {/* Brand Col */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-3">
              <span
                className="d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#d6a84f",
                  color: "#071b1e",
                  border: "2px solid #285943",
                  fontFamily: "Georgia, serif",
                  fontSize: "1.2rem",
                }}
              >
                B
              </span>
              <div>
                <strong className="d-block text-white" style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem", lineHeight: "1.1" }}>
                  Butter Freight
                </strong>
                <small style={{ color: "#8da197", fontSize: "0.68rem", letterSpacing: "0.04em" }}>
                  Intelligent bulk chartering
                </small>
              </div>
            </Link>
            <p className="small mb-3" style={{ color: "#94a3b8", lineHeight: "1.6", maxWidth: "340px" }}>
              AI-assisted freight rate forecasting, vessel optimization, and port infrastructure intelligence for bulk cargo transportation to India’s East Coast.
            </p>
            <div className="d-flex align-items-center gap-2">
              <span className="badge rounded-pill" style={{ backgroundColor: "rgba(214, 168, 79, 0.15)", color: "#d6a84f", border: "1px solid rgba(214, 168, 79, 0.3)", fontSize: "0.7rem", padding: "4px 10px" }}>
                ✦ Multi-Horizon XGBoost + SARIMA
              </span>
            </div>
          </div>

          {/* Explore Links */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: "#d6a84f" }}>
              Explore
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0" style={{ fontSize: "0.88rem" }}>
              <li>
                <Link to="/" className="text-decoration-none footer-link" style={{ color: "#cbd5e1", transition: "color 0.2s" }}>
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => { e.preventDefault(); handleScrollTo("features"); }}
                  className="text-decoration-none footer-link"
                  style={{ color: "#cbd5e1", transition: "color 0.2s" }}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  onClick={(e) => { e.preventDefault(); handleScrollTo("workflow"); }}
                  className="text-decoration-none footer-link"
                  style={{ color: "#cbd5e1", transition: "color 0.2s" }}
                >
                  Solutions
                </a>
              </li>
              <li>
                <Link to="/forecast_query" className="text-decoration-none footer-link" style={{ color: "#cbd5e1", transition: "color 0.2s" }}>
                  Decision Cockpit
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links (About & Contact moved here) */}
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: "#d6a84f" }}>
              Company
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0" style={{ fontSize: "0.88rem" }}>
              <li>
                <Link to="/about" className="text-decoration-none footer-link" style={{ color: "#cbd5e1", transition: "color 0.2s" }}>
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@butterfreight.com"
                  className="text-decoration-none footer-link"
                  style={{ color: "#cbd5e1", transition: "color 0.2s" }}
                >
                  Contact
                </a>
              </li>
              <li>
                <Link to="/about" className="text-decoration-none footer-link" style={{ color: "#cbd5e1", transition: "color 0.2s" }}>
                  Our Mission
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@butterfreight.com"
                  className="text-decoration-none footer-link"
                  style={{ color: "#cbd5e1", transition: "color 0.2s" }}
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Operational Coverage */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", color: "#d6a84f" }}>
              Coverage
            </h6>
            <p className="small mb-2" style={{ color: "#94a3b8", lineHeight: "1.5" }}>
              7 Indian East Coast Ports: Paradip, Visakhapatnam, Gangavaram, Gopalpur, Dhamra, Haldia, Sagar.
            </p>
            <p className="small mb-0" style={{ color: "#8da197", fontSize: "0.75rem" }}>
              Loading Origins: Australia, US, Mozambique, Russia, Indonesia.
            </p>
            <div className="d-flex gap-3 mt-3">
              <small style={{ color: "#64748b", cursor: "pointer" }}>Privacy</small>
              <small style={{ color: "#64748b" }}>•</small>
              <small style={{ color: "#64748b", cursor: "pointer" }}>Terms</small>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-4 mt-4 border-top"
          style={{ borderColor: "#14383c" }}
        >
          <small style={{ color: "#64748b", fontSize: "0.78rem" }}>
            © 2026 Butter Freight • Intelligent Freight Forecasting & Vessel Chartering System. All rights reserved.
          </small>
          <small style={{ color: "#d6a84f", fontSize: "0.78rem", fontWeight: "500" }}>
            ✦ Built for Bulk Logistics Decision Intelligence
          </small>
        </div>
      </div>
    </footer>
  );
}
