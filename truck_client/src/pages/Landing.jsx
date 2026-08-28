import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RouteMap from "../components/RouteMap";
import panamaxImage from "../assets/screenshot-2026-08-26_18-14-46.png";
import { AdaniLogo, JSWLogo, VedantaLogo, AMNSLogo, MaithanLogo } from "../components/CompanyLogos";

const homeOriginCoordinates = { lat: -20.3115, lng: 118.6069 };
const homeDestinationCoordinates = { lat: 20.2648, lng: 86.6947 };

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    organization: "",
    tradeLane: "Australia (Newcastle) -> Paradip",
    message: "",
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(null);
  const [contactError, setContactError] = useState(null);

  // Smooth scroll handler on hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [location.hash]);

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
    if (contactError) setContactError(null);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError(null);
    setContactSuccess(null);

    // Validation
    if (!contactForm.name.trim()) {
      setContactError("Please enter your full name.");
      setContactLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim())) {
      setContactError("Please enter a valid work email address.");
      setContactLoading(false);
      return;
    }
    if (!contactForm.message.trim()) {
      setContactError("Please enter your inquiry details or question.");
      setContactLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:7000"}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit inquiry.");
      }

      setContactSuccess(data.message || "Thank you! Your inquiry has been sent to our chartering desk.");
      setContactForm({
        name: "",
        email: "",
        organization: "",
        tradeLane: "Australia (Newcastle) -> Paradip",
        message: "",
      });
    } catch (err) {
      setContactError(err.message || "Network error. Please try again or email support@butterfreight.com");
    } finally {
      setContactLoading(false);
    }
  };

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
        id="home"
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
                  <span>Explore Features</span><span className="action-arrow" aria-hidden="true">↘</span>
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

      {/* HOW IT WORKS / SOLUTIONS */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
        id="workflow"
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              SOLUTIONS WORKFLOW
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

      {/* OUR MISSION SECTION */}
      <section
        className="py-5"
        style={{ backgroundColor: "#070d18", borderBottom: "1px solid #162234" }}
        id="mission"
      >
        <div className="container py-4">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span className="badge rounded-pill px-3 py-2 mb-3 text-uppercase fw-bold" style={{ backgroundColor: "rgba(214, 168, 79, 0.15)", color: "#d6a84f", border: "1px solid rgba(214, 168, 79, 0.35)", fontSize: "0.75rem" }}>
                OUR MISSION
              </span>
              <h2 className="fw-bold text-white display-6" style={{ fontFamily: "Georgia, serif" }}>
                Transforming Bulk Chartering from Reactive to Predictive
              </h2>
              <p className="lead mt-3" style={{ color: "#94a3b8", fontSize: "1.05rem" }}>
                Move bulk chartering away from daily reactive spot-contract uncertainty toward proactive, data-driven short-term and medium-term chartering strategies.
              </p>
              <p style={{ color: "#8492a6", lineHeight: "1.7" }}>
                By integrating multi-horizon freight rate forecasting, AI-assisted vessel optimization, Sagar Unnati port congestion telemetry, and macro dry bulk market intelligence, Butter Freight equips logistics managers to secure the most favorable chartering windows and eliminate costly port delays.
              </p>
              <div className="d-flex gap-3 mt-4">
                <Link to="/about" className="btn btn-outline-light px-4 py-2 rounded-3 fw-semibold">
                  Read Full Story →
                </Link>
                <button className="btn btn-primary px-4 py-2 rounded-3 fw-semibold" onClick={() => navigate("/forecast_query")} style={{ backgroundColor: "#1e88e5" }}>
                  Launch Decision Cockpit
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 p-md-5 rounded-4" style={{ backgroundColor: "#0b1724", border: "1px solid #18334d" }}>
                <div className="d-flex flex-column gap-4">
                  {[
                    { title: "Data-Driven Rate Hedging", desc: "Lock short and period fixtures before seasonal rate spikes occur." },
                    { title: "Vessel Class Suitability", desc: "Minimize deadheading and port demurrage with automated vessel selection." },
                    { title: "East Coast Terminal Intelligence", desc: "Avoid congested queues with alternative discharge port optimization." },
                  ].map((item, i) => (
                    <div className="d-flex gap-3 align-items-start" key={i}>
                      <span style={{ color: "#d6a84f", fontSize: "1.3rem", fontWeight: "bold" }}>✓</span>
                      <div>
                        <h6 className="fw-bold text-white mb-1">{item.title}</h6>
                        <small style={{ color: "#8492a6" }}>{item.desc}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT & FAQ SECTION */}
      <section
        className="py-5"
        style={{ backgroundColor: "#08131e", borderBottom: "1px solid #162234" }}
        id="support"
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-3 py-2 mb-2 text-uppercase fw-bold" style={{ backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontSize: "0.75rem" }}>
              SUPPORT & GUIDANCE
            </span>
            <h2 className="fw-bold text-white mt-1" style={{ fontFamily: "Georgia, serif" }}>
              How Butter Freight Works
            </h2>
            <p className="mx-auto" style={{ color: "#8492a6", maxWidth: "600px" }}>
              Quick operational answers for procurement directors, logistics coordinators, and chartering teams.
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                q: "How do I run a rate forecast?",
                a: "Select your route, cargo tonnage, and vessel type in the Decision Cockpit. The ML model instantly calculates 30-day and 90-day rate trajectories.",
              },
              {
                q: "What makes vessel optimization smart?",
                a: "The engine checks port draft, beam, queue wait times, and cargo capacity to recommend the most cost-efficient carrier class.",
              },
              {
                q: "How does the AI Co-Pilot assist me?",
                a: "Click 'Ask AI' to query market intelligence, compare port congestion, evaluate chartering timing, or explain specific model forecasts.",
              },
            ].map((faq, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="p-4 rounded-4 h-100" style={{ backgroundColor: "#0a1b2a", border: "1px solid #162e42" }}>
                  <h6 className="fw-bold text-white mb-2">{faq.q}</h6>
                  <p className="small mb-0" style={{ color: "#8492a6", lineHeight: "1.6" }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <Link to="/support" className="text-decoration-none fw-semibold" style={{ color: "#d6a84f" }}>
              View Full Knowledgebase & FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT FORM SECTION */}
      <section
        className="py-5"
        style={{ backgroundColor: "#070d18" }}
        id="contact"
      >
        <div className="container py-4">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5">
              <span className="badge rounded-pill px-3 py-2 mb-3 text-uppercase fw-bold" style={{ backgroundColor: "rgba(214, 168, 79, 0.15)", color: "#d6a84f", border: "1px solid rgba(214, 168, 79, 0.35)", fontSize: "0.75rem" }}>
                CONTACT OPERATIONS
              </span>
              <h2 className="fw-bold text-white display-6" style={{ fontFamily: "Georgia, serif" }}>
                Connect with our Chartering Intelligence Team
              </h2>
              <p className="mt-3" style={{ color: "#8492a6", lineHeight: "1.7" }}>
                Have questions regarding enterprise data feeds, custom discharge port models, or integrating with your ERP? Get in touch with our operations desk.
              </p>
              <div className="d-flex flex-column gap-3 mt-4" style={{ color: "#94a3b8" }}>
                <div>
                  <small className="d-block text-uppercase fw-bold text-white" style={{ fontSize: "0.75rem" }}>Email</small>
                  <span>hello@butterfreight.com</span>
                </div>
                <div>
                  <small className="d-block text-uppercase fw-bold text-white" style={{ fontSize: "0.75rem" }}>Coverage Area</small>
                  <span>India East Coast Bulk Ports & Major Global Loading Origins</span>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="p-4 p-md-5 rounded-4" style={{ backgroundColor: "#091a27", border: "1px solid #162f45" }}>
                <h4 className="fw-bold text-white mb-3">Send an Inquiry</h4>

                {contactSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
                    <span>✓</span>
                    <div>{contactSuccess}</div>
                  </div>
                )}

                {contactError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                    <span>⚠️</span>
                    <div>{contactError}</div>
                  </div>
                )}

                <form onSubmit={handleContactSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small" style={{ color: "#94a3b8" }}>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="e.g. Rahul Verma"
                        value={contactForm.name}
                        onChange={handleContactChange}
                        required
                        style={{ backgroundColor: "#06121d", borderColor: "#183650", color: "#ffffff" }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small" style={{ color: "#94a3b8" }}>Work Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="e.g. rahul@steelcorp.com"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        required
                        style={{ backgroundColor: "#06121d", borderColor: "#183650", color: "#ffffff" }}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small" style={{ color: "#94a3b8" }}>Organization / Company</label>
                      <input
                        type="text"
                        name="organization"
                        className="form-control"
                        placeholder="e.g. JSW / Vedanta / Adani Logistics"
                        value={contactForm.organization}
                        onChange={handleContactChange}
                        style={{ backgroundColor: "#06121d", borderColor: "#183650", color: "#ffffff" }}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small" style={{ color: "#94a3b8" }}>Trade Lane of Interest</label>
                      <select
                        name="tradeLane"
                        className="form-select"
                        value={contactForm.tradeLane}
                        onChange={handleContactChange}
                        style={{ backgroundColor: "#06121d", borderColor: "#183650", color: "#ffffff" }}
                      >
                        <option value="Australia (Newcastle) -> Paradip">Australia (Newcastle) → Paradip</option>
                        <option value="Australia (Newcastle) -> Gangavaram">Australia (Newcastle) → Gangavaram</option>
                        <option value="Indonesia (Banjarmasin) -> Paradip">Indonesia (Banjarmasin) → Paradip</option>
                        <option value="Mozambique (Maputo) -> Visakhapatnam">Mozambique (Maputo) → Visakhapatnam</option>
                        <option value="United States (Houston) -> Dhamra">United States (Houston) → Dhamra</option>
                        <option value="Russia (Vladivostok) -> Haldia">Russia (Vladivostok) → Haldia</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold" style={{ color: "#cbd5e1" }}>Inquiry / Message Details *</label>
                    <textarea
                      name="message"
                      rows="4"
                      className="form-control contact-white-textarea"
                      placeholder="Please specify your bulk cargo volume, chartering window, or data questions..."
                      value={contactForm.message}
                      onChange={handleContactChange}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 fw-bold rounded-3"
                    disabled={contactLoading}
                    style={{ backgroundColor: "#d6a84f", color: "#071b1e" }}
                  >
                    {contactLoading ? (
                      <span className="d-flex align-items-center justify-content-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Submitting Inquiry...
                      </span>
                    ) : (
                      "Submit Inquiry →"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY CHARTERERS AND LOGISTICS TEAMS STRIP */}
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
            <small style={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.75rem", fontWeight: "700" }}>
              Trusted by charterers and logistics teams
            </small>
          </div>
          <div className="trusted-companies-grid d-flex flex-wrap align-items-center gap-4 gap-lg-5">
            <div className="company-logo-item d-flex align-items-center gap-2" title="Adani Group">
              <AdaniLogo />
              <strong className="trusted-client">adani</strong>
            </div>

            <div className="company-logo-item d-flex align-items-center gap-2" title="JSW Group">
              <JSWLogo />
              <strong className="trusted-client">JSW</strong>
            </div>

            <div className="company-logo-item d-flex align-items-center gap-2" title="Vedanta Resources">
              <VedantaLogo />
              <strong className="trusted-client">vedanta</strong>
            </div>

            <div className="company-logo-item d-flex align-items-center gap-2" title="ArcelorMittal Nippon Steel India">
              <AMNSLogo />
              <strong className="trusted-client">AM/NS INDIA</strong>
            </div>

            <div className="company-logo-item d-flex align-items-center gap-2" title="Maithan Alloys Ltd">
              <MaithanLogo />
              <strong className="trusted-client">Maithan Alloys</strong>
            </div>
          </div>
        </div>
      </section>

      {/* REUSABLE STRUCTURED FOOTER */}
      <Footer />
    </main>
  );
};

export default Home;
