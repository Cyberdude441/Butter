import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "📈",
      title: "Freight Rate Forecasting",
      text: "Analyze historical freight trends across major overseas trade routes into India’s East Coast."
    },
    {
      icon: "⏱️",
      title: "Charter Timing Intelligence",
      text: "Identify favorable windows for locking short and mid-term vessel charter contracts."
    },
    {
      icon: "🚢",
      title: "Vessel Selection",
      text: "Recommend Handysize, Supramax, Panamax or Capesize vessels based on cargo and port constraints."
    },
    {
      icon: "⚓",
      title: "Port Infrastructure Analysis",
      text: "Evaluate draft, LOA, beam and cargo handling compatibility for loading and discharge ports."
    },
    {
      icon: "🔄",
      title: "Idle Voyage Optimization",
      text: "Reduce deadheading by suggesting efficient vessel deployment between consecutive voyages."
    },
    {
      icon: "⚠️",
      title: "Market Risk Monitoring",
      text: "Receive early warnings for freight volatility, congestion and operational disruptions."
    }
  ];

  return (
    <main
      style={{ backgroundColor: "#070d18", minHeight: "100vh" }}
      className="text-white about-page"
    >
      <Navbar />

      {/* HERO */}
      <section className="py-5" style={{ backgroundColor: "#070d18" }}>
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span
                className="badge rounded-pill px-3 py-2 mb-3 text-uppercase fw-bold tracking-wider"
                style={{
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  fontSize: "0.75rem",
                }}
              >
                ABOUT THE PROJECT
              </span>

              <h1 className="display-4 fw-bold text-white">
                Intelligent Freight Forecasting
                <br />
                <span style={{ color: "#38bdf8" }}>
                  for Optimized Vessel Chartering
                </span>
              </h1>

              <p
                className="lead mt-4"
                style={{ color: "#8492a6", maxWidth: "600px" }}
              >
                A decision-support platform designed for logistics managers and
                procurement teams handling overseas bulk cargo imports to India’s
                East Coast ports.
              </p>

              <p style={{ color: "#8492a6", maxWidth: "600px" }}>
                The system combines freight market analysis, AI-assisted
                reasoning, vessel recommendation and port infrastructure
                intelligence to support proactive chartering decisions instead of
                reactive daily market engagement.
              </p>
            </div>

            <div className="col-lg-5">
              <div
                className="card border-0 shadow-lg rounded-4 p-2"
                style={{
                  backgroundColor: "#0b1320",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4 text-white">
                  <small
                    className="text-uppercase fw-bold tracking-wider"
                    style={{ color: "#8492a6", fontSize: "0.7rem" }}
                  >
                    PROJECT FOCUS
                  </small>

                  <h4 className="fw-bold mt-2 text-white">
                    Bulk Cargo Procurement Intelligence
                  </h4>

                  <div className="mt-4">
                    <div
                      className="d-flex justify-content-between py-3 border-bottom"
                      style={{ borderColor: "#162234" }}
                    >
                      <span style={{ color: "#8492a6" }}>Cargo</span>
                      <strong className="text-white">Coal & Bulk Commodities</strong>
                    </div>

                    <div
                      className="d-flex justify-content-between py-3 border-bottom"
                      style={{ borderColor: "#162234" }}
                    >
                      <span style={{ color: "#8492a6" }}>Vessels</span>
                      <strong className="text-white">Handysize → Capesize</strong>
                    </div>

                    <div className="d-flex justify-content-between py-3">
                      <span style={{ color: "#8492a6" }}>Objective</span>
                      <strong style={{ color: "#38bdf8" }}>
                        Smarter Charter Decisions
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
      >
        <div className="container py-5">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <small
                className="text-uppercase fw-bold tracking-wider"
                style={{ color: "#38bdf8", fontSize: "0.75rem" }}
              >
                THE CHALLENGE
              </small>

              <h2 className="fw-bold display-6 mt-2 text-white">
                Vessel chartering is often driven by daily market uncertainty.
              </h2>
            </div>

            <div className="col-lg-6">
              <p style={{ color: "#8492a6" }}>
                Procurement teams importing coal and other bulk commodities must
                continuously monitor volatile freight markets, changing vessel
                availability, port congestion and fluctuating charter rates across
                international trade routes.
              </p>

              <p className="mb-0" style={{ color: "#8492a6" }}>
                Traditional decision-making is largely reactive, relying on daily
                market observations rather than structured historical analysis,
                making it difficult to consistently secure cost-effective charter
                contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section className="py-5" style={{ backgroundColor: "#070d18" }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              OUR APPROACH
            </small>

            <h2 className="fw-bold mt-2 text-white">
              From reactive procurement to predictive chartering.
            </h2>

            <p className="mx-auto" style={{ color: "#8492a6", maxWidth: "650px" }}>
              AI-assisted reasoning layered on historical freight market data.
            </p>
          </div>

          <div className="row g-4">
            {[
              [
                "01",
                "Collect Market Intelligence",
                "Aggregate freight rate trends across Australia, Indonesia, Mozambique, Russia and the United States trade corridors."
              ],
              [
                "02",
                "Forecast Rate Movements",
                "Analyze historical patterns and generate intelligent freight trend insights for upcoming charter decisions."
              ],
              [
                "03",
                "Evaluate Vessel & Port Fit",
                "Match cargo volume with suitable vessel classes while respecting draft, LOA, beam and handling capacity."
              ],
              [
                "04",
                "Recommend Charter Strategy",
                "Provide optimal market entry timing, risk alerts and operational recommendations for procurement teams."
              ]
            ].map(([number, title, text]) => (
              <div className="col-md-6" key={number}>
                <div
                  className="card border-0 rounded-4 h-100 p-2"
                  style={{
                    backgroundColor: "#0b1320",
                    border: "1px solid #162234",
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex gap-3 align-items-start">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0 shadow"
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#1e88e5",
                        }}
                      >
                        {number}
                      </div>

                      <div>
                        <h5 className="fw-bold text-white">{title}</h5>
                        <p className="mb-0" style={{ color: "#8492a6" }}>
                          {text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
      >
        <div className="container py-5">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              CORE CAPABILITIES
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Built for bulk cargo logistics operations.
            </h2>
          </div>

          <div className="row g-4">
            {features.map((feature) => (
              <div className="col-md-6 col-lg-4" key={feature.title}>
                <div
                  className="card border-0 rounded-4 h-100 p-2"
                  style={{
                    backgroundColor: "#070d18",
                    border: "1px solid #162234",
                  }}
                >
                  <div className="card-body p-4">
                    <div className="fs-1 mb-3">{feature.icon}</div>

                    <h5 className="fw-bold text-white">{feature.title}</h5>

                    <p className="small mb-0" style={{ color: "#8492a6" }}>
                      {feature.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EAST COAST PORTS */}
      <section className="py-5" style={{ backgroundColor: "#070d18" }}>
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <small
                className="text-uppercase fw-bold tracking-wider"
                style={{ color: "#38bdf8", fontSize: "0.75rem" }}
              >
                OPERATIONAL COVERAGE
              </small>

              <h2 className="fw-bold display-6 mt-2 text-white">
                Supporting procurement across India’s East Coast.
              </h2>

              <p className="mt-3 mb-0" style={{ color: "#8492a6" }}>
                The platform focuses on overseas bulk cargo movements into the
                country’s major eastern ports, enabling port-aware vessel
                selection and discharge planning.
              </p>
            </div>

            <div className="col-lg-6">
              <div className="d-flex flex-wrap gap-2">
                {[
                  "Paradip",
                  "Visakhapatnam",
                  "Gangavaram",
                  "Gopalpur",
                  "Dhamra",
                  "Sagar-Sandheads",
                  "Haldia"
                ].map((port) => (
                  <span
                    key={port}
                    className="badge rounded-pill px-3 py-2 text-white fw-normal"
                    style={{
                      backgroundColor: "#0b1320",
                      border: "1px solid #1b2a3f",
                      fontSize: "0.875rem",
                    }}
                  >
                    ⚓ {port}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
      >
        <div className="container py-5">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              DECISION INTELLIGENCE
            </small>

            <h2 className="fw-bold mt-2 text-white">
              The platform helps optimize strategic procurement decisions.
            </h2>
          </div>

          <div className="row g-4 text-center">
            {[
              ["📈", "Freight Cost", "Track market rate movements"],
              ["🚢", "Vessel Selection", "Match cargo with suitable carriers"],
              ["⚓", "Port Readiness", "Respect infrastructure limitations"],
              ["⚠️", "Operational Risk", "Identify volatility and congestion"]
            ].map(([icon, title, text]) => (
              <div className="col-6 col-lg-3" key={title}>
                <div className="p-3">
                  <div className="fs-2 mb-2">{icon}</div>

                  <h5 className="fw-bold text-white">{title}</h5>

                  <p className="small mb-0" style={{ color: "#8492a6" }}>
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ backgroundColor: "#070d18" }}>
        <div className="container py-4">
          <div
            className="rounded-4 p-5 text-white"
            style={{
              backgroundColor: "#0b1320",
              border: "1px solid #1e88e5",
              backgroundImage:
                "linear-gradient(135deg, rgba(30,136,229,0.1), rgba(11,19,32,1))",
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 className="fw-bold text-white">
                  Ready to make data-driven chartering decisions?
                </h2>

                <p className="mb-0" style={{ color: "#8492a6" }}>
                  Access freight market intelligence, vessel recommendations and
                  procurement insights from one integrated logistics dashboard.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                <button
                  className="btn btn-lg px-4 fw-bold text-white rounded-3"
                  style={{ backgroundColor: "#1e88e5" }}
                  onClick={() => navigate("/forecast_results")}
                >
                  Open Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-4"
        style={{
          backgroundColor: "#050a10",
          borderTop: "1px solid #162234",
        }}
      >
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <small style={{ color: "#64748b" }}>
              © 2026 Intelligent Freight Forecasting System
            </small>

            <div className="d-flex gap-4">
              <small
                style={{ color: "#8492a6", cursor: "pointer" }}
                className="hover-opacity"
              >
                Privacy
              </small>
              <small
                style={{ color: "#8492a6", cursor: "pointer" }}
                className="hover-opacity"
              >
                Terms
              </small>
              <small
                style={{ color: "#8492a6", cursor: "pointer" }}
                className="hover-opacity"
              >
                Contact
              </small>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default About;