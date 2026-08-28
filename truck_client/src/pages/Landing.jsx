import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RouteMap from "../components/RouteMap";
import panamaxImage from "../assets/screenshot-2026-08-26_18-14-46.png";

const homeOriginCoordinates = { lat: -20.3115, lng: 118.6069 };
const homeDestinationCoordinates = { lat: 20.2648, lng: 86.6947 };

const Home = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    if (window.location.hash === "#features") {
      window.setTimeout(() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }), 0);
    }
  }, []);

  return (
    <main
      style={{ backgroundColor: "#070d18", minHeight: "100vh" }}
      className="text-white home-page"
    >
      <Navbar />

      {/* HERO */}
      <section
        className="hero-section py-5"
        style={{ backgroundColor: "#070d18" }}
      >
        <div className="hero-particles" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold text-white">
                <span className="hero-kicker">BULK FREIGHT INTELLIGENCE</span>
                <br />
                Make proactive chartering decisions
              </h1>

              <p
                className="lead mt-4"
                style={{ color: "#8492a6", maxWidth: "600px" }}
              >
                A decision-support platform that helps procurement and logistics
                teams forecast freight trends, identify the best chartering
                window, and optimize bulk cargo imports to India’s East Coast
                ports.
              </p>

              <div className="d-flex gap-3 mt-4">
                <button
                  type="button"
                  className="btn primary-action btn-lg px-4 fw-bold rounded-3"
                  style={{ backgroundColor: "#1e88e5" }}
                  onClick={() => navigate("/forecast_query")}
                >
                  <span>Start Forecast</span><span className="action-arrow" aria-hidden="true">→</span>
                </button>

                <button
                  type="button"
                  className="btn secondary-action btn-lg px-4 rounded-3"
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                  style={{
                    color: "#8492a6",
                    backgroundColor: "transparent",
                    border: "1px solid #1b2a3f",
                  }}
                >
                  <span>View Demo</span><span className="action-arrow" aria-hidden="true">↘</span>
                </button>
              </div>

              <div className="row mt-5">
                <div className="col-4 metric-stat metric-tile">
                  <span className="metric-icon" aria-hidden="true">⚓</span>
                  <h4 className="fw-bold" style={{ color: "#38bdf8" }}>7</h4>
                  <small style={{ color: "#64748b" }}>
                    East Coast Ports
                  </small>
                </div>

                <div className="col-4 metric-stat metric-tile">
                  <span className="metric-icon" aria-hidden="true">▣</span>
                  <h4 className="fw-bold" style={{ color: "#38bdf8" }}>4</h4>
                  <small style={{ color: "#64748b" }}>
                    Bulk Carrier Types
                  </small>
                </div>

                <div className="col-4 metric-stat metric-tile">
                  <span className="metric-icon" aria-hidden="true">⌁</span>
                  <h4 className="fw-bold" style={{ color: "#38bdf8" }}>6</h4>
                  <small style={{ color: "#64748b" }}>
                    Major Trade Routes
                  </small>
                </div>
              </div>
            </div>

            {/* DASHBOARD CARD */}
            <div className="col-lg-6">
              <div className="home-map-panel">
                <div className="home-map-label"><span>ROUTE INTELLIGENCE</span><strong>Australia → India East Coast</strong></div>
                <RouteMap
                  origin="Australia"
                  destination="Paradip"
                  originLabel="Newcastle, Australia"
                  originCoordinates={homeOriginCoordinates}
                  destinationCoordinates={homeDestinationCoordinates}
                />
              </div>
              <div
                className="card market-preview border-0 shadow-lg rounded-4 p-2"
                style={{
                  backgroundColor: "#0b1320",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4 text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small
                        className="text-uppercase fw-bold tracking-wider"
                        style={{ color: "#8492a6", fontSize: "0.7rem" }}
                      >
                        FREIGHT MARKET SNAPSHOT
                      </small>
                      <h4 className="fw-bold mt-1 text-white">
                        Australia → Paradip
                      </h4>
                    </div>

                    <span
                      className="badge rounded-pill px-3 py-2"
                      style={{
                        backgroundColor: "rgba(74, 222, 128, 0.15)",
                        color: "#4ade80",
                      }}
                    >
                      ● Forecast Stable
                    </span>
                  </div>

                  <div
                    className="rounded-4 my-4 p-4"
                    style={{
                      height: "230px",
                      backgroundColor: "#070d18",
                      border: "1px solid #162234",
                    }}
                  >
                    <div className="h-100 d-flex flex-column justify-content-center">
                      <div className="d-flex justify-content-between mb-3">
                        <strong style={{ color: "#8492a6" }}>Loading</strong>
                        <strong style={{ color: "#8492a6" }}>Discharge</strong>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-center">
                          <div
                            className="rounded-circle mx-auto mb-2"
                            style={{
                              width: 18,
                              height: 18,
                              backgroundColor: "#1e88e5",
                            }}
                          />
                          <small className="text-white">Newcastle</small>
                        </div>

                        <div className="flex-grow-1 mx-3">
                          <div className="text-center mb-2 text-white">
                            <img className="home-vessel-icon" src={panamaxImage} alt="Panamax vessel" /> Panamax
                          </div>
                          <svg className="snapshot-zigzag" viewBox="0 0 300 24" role="img" aria-label="Route path from Newcastle to Paradip">
                            <polyline points="0,15 42,15 72,7 104,18 140,8 176,16 212,6 248,15 300,15" fill="none" stroke="#285943" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>

                        <div className="text-center">
                          <div
                            className="rounded-circle mx-auto mb-2"
                            style={{
                              width: 18,
                              height: 18,
                              backgroundColor: "#1e88e5",
                            }}
                          />
                          <small className="text-white">Paradip</small>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <small style={{ color: "#64748b" }}>
                          AI Recommendation
                        </small>
                        <h5 className="fw-bold mt-1" style={{ color: "#4ade80" }}>
                          Lock Charter in 5–7 Days
                        </h5>
                      </div>
                    </div>
                  </div>

                  <div
                    className="row text-center pt-3 border-top"
                    style={{ borderColor: "#162234 !important" }}
                  >
                    <div className="col-4">
                      <small className="d-block" style={{ color: "#64748b" }}>
                        Vessel
                      </small>
                      <strong className="text-white">Panamax</strong>
                    </div>

                    <div className="col-4 border-start border-end border-secondary border-opacity-25">
                      <small className="d-block" style={{ color: "#64748b" }}>
                        Cargo
                      </small>
                      <strong className="text-white">72,000 MT</strong>
                    </div>

                    <div className="col-4">
                      <small className="d-block" style={{ color: "#64748b" }}>
                        Risk
                      </small>
                      <strong style={{ color: "#4ade80" }}>Low</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        className="py-5"
        style={{ backgroundColor: "#070d18" }}
        id="features"
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              DECISION SUPPORT FEATURES
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Everything needed for intelligent bulk cargo procurement.
            </h2>

            <p className="mx-auto" style={{ color: "#8492a6", maxWidth: "650px" }}>
              AI-assisted reasoning layered on historical freight market trends
              for proactive chartering decisions.
            </p>
          </div>

          <div className="row g-4">
            {[
              [
                "📈",
                "Freight Trend Forecasting",
                "Monitor historical and projected freight rate movements for Handysize, Supramax, Panamax and Capesize vessels.",
              ],
              [
                "⏱️",
                "Optimal Charter Timing",
                "Identify the most favorable market entry window before locking short or mid-term charter contracts.",
              ],
              [
                "🚢",
                "Vessel Recommendation",
                "Recommend suitable vessel classes based on cargo volume and operational requirements.",
              ],
              [
                "⚓",
                "Port Compatibility",
                "Evaluate draft, LOA, beam and cargo handling constraints across East Coast ports.",
              ],
              [
                "🔄",
                "Idle-Time Reduction",
                "Minimize deadheading between voyages through voyage planning suggestions.",
              ],
              [
                "⚠️",
                "Risk & Congestion Alerts",
                "Receive early warnings for freight volatility, market disruptions and port congestion.",
              ],
            ].map(([icon, title, text]) => (
              <div className="col-md-6 col-lg-4" key={title}>
                <div
                  className={`card feature-card interactive-card border-0 rounded-4 h-100 p-2 ${selectedFeature === title ? "is-selected" : ""}`}
                  onClick={() => setSelectedFeature(selectedFeature === title ? null : title)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => event.key === "Enter" && setSelectedFeature(selectedFeature === title ? null : title)}
                  style={{
                    backgroundColor: "#0b1320",
                    border: "1px solid #162234",
                  }}
                >
                  <div className="card-body p-4">
                    <div className="fs-1 mb-3">{icon}</div>
                    <h5 className="fw-bold text-white">{title}</h5>
                    <p className="small mb-0" style={{ color: "#8492a6" }}>
                      {text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
      >
        <div className="container py-4" id="workflow">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              WORKFLOW
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Forecast. Evaluate. Charter.
            </h2>
          </div>

          <div className="row g-4 text-center">
            {[
              [
                "01",
                "Select Trade Route",
                "Choose loading and discharge ports across Australia, Indonesia, Mozambique, Russia, the US and India.",
              ],
              [
                "02",
                "Analyze Freight Market",
                "Review freight trends, vessel availability and AI-generated charter timing recommendations.",
              ],
              [
                "03",
                "Finalize Charter Strategy",
                "Select the optimal vessel and reduce operational risk before procurement decisions.",
              ],
            ].map(([number, title, text]) => (
              <div className="col-md-4" key={number}>
                <div className="p-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold text-white shadow"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#1e88e5",
                    }}
                  >
                    {number}
                  </div>

                  <h5 className="fw-bold text-white">{title}</h5>
                  <p className="small" style={{ color: "#8492a6" }}>
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
                <small
                  className="text-uppercase fw-bold tracking-wider"
                  style={{ color: "#38bdf8", fontSize: "0.75rem" }}
                >
                  BULK FREIGHT INTELLIGENCE
                </small>

                <h2 className="fw-bold mt-2 text-white">
                  Make proactive chartering decisions backed by freight
                  analytics.
                </h2>

                <p className="mb-0" style={{ color: "#8492a6" }}>
                  Built for logistics managers and procurement teams handling
                  overseas bulk cargo imports into India’s East Coast.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                <button
                  className="btn btn-lg px-4 fw-bold text-white rounded-3"
                  style={{ backgroundColor: "#1e88e5" }}
                  onClick={() => navigate("/forecast_query")}
                >
                  Launch Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPROVED BRAND-CONSISTENT TRUSTED BY CLIENT LOGO SECTION */}
      <section className="trusted-band py-4">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-4">
          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#d6a84f",
                display: "inline-block",
              }}
            ></span>
            <small style={{ color: "#8da197", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.75rem", fontWeight: "600" }}>
              Trusted by charterers and logistics teams
            </small>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-4 gap-lg-5">
            <strong className="trusted-client">adani</strong>
            <strong className="trusted-client">JSW</strong>
            <strong className="trusted-client">vedanta</strong>
            <strong className="trusted-client">AM/NS INDIA</strong>
            <strong className="trusted-client">Maithan Alloys</strong>
          </div>
        </div>
      </section>

      {/* REUSABLE STRUCTURED FOOTER */}
      <Footer />
    </main>
  );
};

export default Home;
