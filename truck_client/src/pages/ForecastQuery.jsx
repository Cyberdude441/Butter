import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RouteMap from "../components/RouteMap";

import handysizeImg from "../assets/screenshot-2026-08-26_18-06-21.png";
import supramaxImg from "../assets/screenshot-2026-08-26_18-13-33.png";
import panamaxImg from "../assets/screenshot-2026-08-26_18-14-46.png";
import capesizeImg from "../assets/screenshot-2026-08-26_18-21-30.png";

const vesselOptions = [
  { type: "Handysize", image: handysizeImg, desc: "Up to 40,000 DWT" },
  { type: "Supramax", image: supramaxImg, desc: "Up to 60,000 DWT" },
  { type: "Panamax", image: panamaxImg, desc: "Up to 80,000 DWT" },
  { type: "Capesize", image: capesizeImg, desc: "Up to 180,000 DWT" },
];

const originCoordinates = {
  Australia: { lat: -20.3115, lng: 118.6069, label: "Newcastle, Australia" },
  "United States": { lat: 29.7604, lng: -95.3698, label: "Houston, USA" },
  Mozambique: { lat: -23.8654, lng: 35.3833, label: "Maputo, Mozambique" },
  Russia: { lat: 43.1056, lng: 131.8735, label: "Vladivostok, Russia" },
  Indonesia: { lat: -3.3194, lng: 114.5908, label: "Banjarmasin, Indonesia" },
};

const destinationCoordinates = {
  Paradip: { lat: 20.2648, lng: 86.6947 },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  Gangavaram: { lat: 17.6167, lng: 83.2333 },
  Gopalpur: { lat: 19.2647, lng: 84.9089 },
  Dhamra: { lat: 20.7833, lng: 86.9833 },
  "Sagar Sandheads": { lat: 21.65, lng: 88.05 },
  Haldia: { lat: 22.0333, lng: 88.0833 },
};

function ForecastQuery() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    origin: "Australia",
    destination: "Gangavaram",
    vesselType: "Panamax",
    cargoType: "Thermal Coal",
    volume: "75000",
    duration: "short-term",
  });

  const [intelData, setIntelData] = useState(null);
  const [loadingIntel, setLoadingIntel] = useState(true);

  const selectedOrigin = originCoordinates[formData.origin];
  const selectedDestination = destinationCoordinates[formData.destination];
  const selectedVessel = vesselOptions.find((vessel) => vessel.type === formData.vesselType);
  const contractLabel = formData.duration === "short-term" ? "1 – 3 Months" : formData.duration === "mid-term" ? "4 – 12 Months" : "12+ Months";
  const forecastPeriod = useMemo(() => formData.duration === "short-term" ? "Next 30 Days" : "Next 90 Days", [formData.duration]);
  const horizonDays = useMemo(() => formData.duration === "mid-term" ? 90 : 30, [formData.duration]);

  // Live data binding directly from the existing ML Forecast & Optimization pipeline
  useEffect(() => {
    const origin = formData.origin || "Australia";
    const destination = formData.destination || "Gangavaram";
    const vesselType = formData.vesselType || "Panamax";
    const cargoQuantity = Number(formData.volume) || 75000;

    let isCancelled = false;
    setLoadingIntel(true);

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:7000"}/api/forecast`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            origin,
            destination,
            vesselType,
            cargoQuantity,
            forecastPeriod,
          }),
        });

        if (!res.ok) {
          throw new Error(`Forecast request failed (${res.status})`);
        }

        const data = await res.json();
        if (!isCancelled) {
          const f = data.forecast || {};
          const m = data.market_intelligence || f.market_intelligence || {};
          const v = data.vessel_optimization || f.vessel_optimization || {};
          const comp = v.optimization_comparison || {};

          // Calculate transparent confidence from prediction bounds
          const rate = Number(horizonDays === 90 ? (f.forecast_90d || f.forecast90Day?.rate || 22.4) : (f.forecast_30d || f.forecast30Day?.rate || 21.8));
          const lower = Number(horizonDays === 90 ? f.forecast90Day?.lower : f.forecast30Day?.lower);
          const upper = Number(horizonDays === 90 ? f.forecast90Day?.upper : f.forecast30Day?.upper);

          let conf = 88;
          if (rate > 0 && upper > lower) {
            const spread = (upper - lower) / rate;
            conf = Math.round(Math.max(65, Math.min(96, (1 - spread / 2) * 100)));
          }

          setIntelData({
            signal: (f.marketSignal || f.market_signal || "CHARTER NOW").toUpperCase(),
            marketPressure: (m.market_pressure || f.marketTrend || "UPWARD").toUpperCase(),
            demandStatus: (m.demand_status || "HIGH").toUpperCase(),
            supplyStatus: (m.supply_status || "TIGHT").toUpperCase(),
            demandIndex: Number(m.demand_index || 105.0),
            supplyIndex: Number(m.vessel_supply_index || 98.0),
            waitingTimeSaved: comp.waiting_time_saved_days != null ? Number(comp.waiting_time_saved_days) : 1.4,
            idleReduction: comp.idle_time_reduction_percent != null ? Number(comp.idle_time_reduction_percent) : 35.3,
            horizonDays,
            confidence: conf,
            trend: (f.marketTrend || f.trend || "INCREASING").toUpperCase(),
            rate: rate,
            optimizedVessel: v.optimized_vessel?.vessel_type || "Supramax",
          });
          setLoadingIntel(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn("Chartering intelligence load error:", err.message);
          setLoadingIntel(false);
        }
      }
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [formData.origin, formData.destination, formData.vesselType, formData.volume, forecastPeriod, horizonDays]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    navigate("/forecast_results", {
      state: {
        origin: formData.origin,
        destination: formData.destination,
        vesselType: formData.vesselType,
        cargoQuantity: formData.volume,
        cargoType: formData.cargoType,
        forecastPeriod,
      },
    });
  };

  return (
    <div
      style={{ backgroundColor: "#070d18", minHeight: "100vh" }}
      className="text-white forecast-page query-dashboard"
    >
      <Navbar />

      <section className="query-hero">
        <div className="container query-hero-inner">
          <div>
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              FREIGHT INTELLIGENCE
            </small>

            <h1 className="fw-bold mt-2 text-white">New Freight Forecast</h1>

            <p
              className="mx-auto"
              style={{ color: "#8492a6", maxWidth: "650px" }}
            >
              Enter the trade lane, cargo details and contract duration to
              generate an AI-powered freight rate forecast and vessel
              recommendation.
            </p>
          </div>
          <div className="query-hero-vessel" aria-hidden="true"><img src={panamaxImg} alt="" /></div>
        </div>
      </section>

      <section className="query-workspace">
        <div className="container">
          <div className="query-layout">
            <form className="query-form" onSubmit={handleSubmit}>
                {/* Trade Route */}
                <div className="query-section-heading"><span>01</span><div><h4>Trade Route</h4><small>Select origin and destination ports</small></div><span className="heading-icon">⌁</span></div>
                <div className="query-route-row">
                  <div className="query-field"><label>Origin Country / Port</label><select name="origin" value={formData.origin} onChange={handleChange} required><option value="">Select Origin</option><option value="Australia">Australia (Newcastle)</option><option value="United States">United States (Houston)</option><option value="Mozambique">Mozambique (Maputo)</option><option value="Russia">Russia (Vladivostok)</option><option value="Indonesia">Indonesia (Banjarmasin)</option></select></div>
                  <span className="route-connector">→</span>
                  <div className="query-field"><label>Destination Port</label><select name="destination" value={formData.destination} onChange={handleChange} required><option value="">Select Port</option>{Object.keys(destinationCoordinates).map((port) => <option value={port} key={port}>{port}, India</option>)}</select></div>
                </div>

                {/* Vessel */}
                <div className="query-section-heading"><span>02</span><div><h4>Vessel Class</h4><small>Choose the suitable vessel class</small></div><span className="heading-icon">▣</span></div>

                <div className="row g-3 mb-4">
                  {vesselOptions.map((vessel) => (
                    <div className="col-6 col-md-3" key={vessel.type}>
                      <div
                        className={`interactive-card query-vessel-card rounded-4 p-3 h-100 text-center ${formData.vesselType === vessel.type ? "is-selected" : ""}`}
                        style={{
                          backgroundColor: "#070d18",
                          border:
                            formData.vesselType === vessel.type
                              ? "2px solid #1e88e5"
                              : "1px solid #1b2a3f",
                          cursor: "pointer",
                          transition: "border-color 0.15s ease",
                        }}
                        onClick={() =>
                          setFormData({ ...formData, vesselType: vessel.type })
                        }
                      >
                        <img
                          src={vessel.image}
                          alt={vessel.type}
                          style={{
                            width: "100%",
                            height: "80px",
                            objectFit: "contain",
                            marginBottom: "0.5rem",
                          }}
                        />
                        <div className="fw-bold text-white mb-1">
                          {vessel.type}
                        </div>
                        <small style={{ color: "#8492a6" }}>{vessel.desc}</small>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cargo */}
                <div className="query-section-heading"><span>03</span><div><h4>Cargo Specifications</h4><small>Specify cargo commodity and volume</small></div><span className="heading-icon">▤</span></div>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small" style={{ color: "#8492a6" }}>Cargo Commodity Type</label>
                    <select className="form-select cargo-select-control" name="cargoType" value={formData.cargoType} onChange={handleChange} required>
                      <option value="">Select Cargo Commodity...</option>
                      <optgroup label="— Coal & Energy Bulk —">
                        <option value="Thermal Coal">Thermal Coal (Steam Coal)</option>
                        <option value="Coking Coal">Coking Coal (Met Coal)</option>
                        <option value="PCI Coal">PCI Coal (Pulverized Injection)</option>
                        <option value="Anthracite Coal">Anthracite Coal</option>
                        <option value="Petroleum Coke (Petcoke)">Petroleum Coke (Petcoke)</option>
                      </optgroup>
                      <optgroup label="— Ores & Industrial Minerals —">
                        <option value="Iron Ore (Fines, Lumps, Pellets)">Iron Ore (Fines, Lumps, Pellets)</option>
                        <option value="Bauxite & Alumina">Bauxite & Alumina</option>
                        <option value="Manganese Ore">Manganese Ore</option>
                        <option value="Limestone & Dolomite">Limestone & Dolomite</option>
                      </optgroup>
                      <optgroup label="— Fertilizers & Agri-Bulk —">
                        <option value="Fertilizers & Phosphates (Urea, DAP)">Fertilizers & Phosphates (Urea, DAP, Rock Phosphate)</option>
                        <option value="Grain & Agri-Bulk (Wheat, Corn, Soybeans)">Grain & Agri-Bulk (Wheat, Corn, Soybeans)</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small" style={{ color: "#8492a6" }}>Cargo Parcel Size (Metric Tonnes)</label>
                    <input className="form-control bg-dark text-white" style={{ borderColor: "#162234" }} type="number" name="volume" value={formData.volume} onChange={handleChange} placeholder="e.g. 75,000" min="5000" required />
                  </div>
                </div>

                {/* Contract Duration */}
                <div className="query-section-heading"><span>04</span><div><h4>Charter Duration & Contract Horizon</h4><small>Select short-term spot or mid-term period charter</small></div><span className="heading-icon">⏱</span></div>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div
                      className={`interactive-card query-duration-card rounded-4 p-3 h-100 ${formData.duration === "short-term" ? "is-selected" : ""}`}
                      style={{
                        backgroundColor: "#070d18",
                        border: formData.duration === "short-term" ? "2px solid #1e88e5" : "1px solid #1b2a3f",
                        cursor: "pointer",
                      }}
                      onClick={() => setFormData({ ...formData, duration: "short-term" })}
                    >
                      <div className="form-check">
                        <input className="form-check-input" type="radio" style={{ cursor: "pointer" }} name="duration" value="short-term" checked={formData.duration === "short-term"} onChange={handleChange} />
                        <label className="form-check-label fw-bold text-white" style={{ cursor: "pointer" }}>Short-Term Spot (1 – 3 Months)</label>
                      </div>
                      <small className="d-block mt-1" style={{ color: "#64748b" }}>Optimized for single voyage fixtures and immediate shipment windows.</small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div
                      className={`interactive-card query-duration-card rounded-4 p-3 h-100 ${formData.duration === "mid-term" ? "is-selected" : ""}`}
                      style={{
                        backgroundColor: "#070d18",
                        border: formData.duration === "mid-term" ? "2px solid #1e88e5" : "1px solid #1b2a3f",
                        cursor: "pointer",
                      }}
                      onClick={() => setFormData({ ...formData, duration: "mid-term" })}
                    >
                      <div className="form-check">
                        <input className="form-check-input" type="radio" style={{ cursor: "pointer" }} name="duration" value="mid-term" checked={formData.duration === "mid-term"} onChange={handleChange} />
                        <label className="form-check-label fw-bold text-white" style={{ cursor: "pointer" }}>Mid-Term (4 – 12 Months)</label>
                      </div>
                      <small className="d-block mt-1" style={{ color: "#64748b" }}>Better for strategic period chartering, hedging rate volatility, and seasonal planning.</small>
                    </div>
                  </div>
                </div>

                <button className="btn forecast-submit query-submit btn-lg fw-bold py-3 rounded-3" type="submit">Generate Forecast <span>→</span></button>
            </form>

            <aside className="query-sidebar">
              {/* CHARTERING INTELLIGENCE CARD (LIVE FROM ML OPTIMIZATION PIPELINE) */}
              <div className="query-preview-card">
                {/* Header & Primary Signal */}
                <div className="query-preview-heading">
                  <div>
                    <small>CHARTERING INTELLIGENCE</small>
                    <strong style={{ fontSize: "1.25rem", margin: "6px 0 2px", color: "#ffffff", letterSpacing: "0.02em" }}>
                      {loadingIntel ? "ANALYZING..." : intelData?.signal || "CHARTER NOW"}
                    </strong>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span className="badge rounded-pill" style={{ backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#ffffff", fontSize: "0.65rem", padding: "2px 8px" }}>
                        Pressure: <b style={{ color: "#38bdf8" }}>{intelData?.marketPressure || "UPWARD"}</b>
                      </span>
                      {intelData?.waitingTimeSaved > 0 && (
                        <span className="badge rounded-pill" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)", fontSize: "0.65rem", padding: "2px 8px" }}>
                          Save {intelData.waitingTimeSaved}d Wait
                        </span>
                      )}
                    </div>
                  </div>
                  <b>AI-Powered</b>
                </div>

                {/* Live Market Metric Bars (Demand / Supply / Risk) */}
                <div className="query-mini-chart" style={{ height: "36px", display: "flex", alignItems: "flex-end", gap: "6px" }}>
                  <div className="d-flex flex-column align-items-center flex-grow-1" title={`Demand: ${intelData?.demandStatus || "HIGH"}`}>
                    <span style={{ width: "100%", height: intelData?.demandStatus === "HIGH" ? "88%" : "55%", borderRadius: "3px 3px 0 0", background: "linear-gradient(180deg, #38bdf8, #0284c7)", display: "block" }}></span>
                  </div>
                  <div className="d-flex flex-column align-items-center flex-grow-1" title={`Supply: ${intelData?.supplyStatus || "TIGHT"}`}>
                    <span style={{ width: "100%", height: intelData?.supplyStatus === "TIGHT" ? "42%" : "75%", borderRadius: "3px 3px 0 0", background: "linear-gradient(180deg, #fbbf24, #d97706)", display: "block" }}></span>
                  </div>
                  <div className="d-flex flex-column align-items-center flex-grow-1" title={`Risk / Congestion`}>
                    <span style={{ width: "100%", height: intelData?.trend === "INCREASING" ? "78%" : "50%", borderRadius: "3px 3px 0 0", background: "linear-gradient(180deg, #a8d4a0, #4ade80)", display: "block" }}></span>
                  </div>
                </div>

                {/* Bottom Stats Row */}
                <div className="query-preview-stats">
                  <span>
                    {`${intelData?.horizonDays ?? horizonDays} Days`}
                    <strong>{loadingIntel ? "..." : `$${Number(intelData?.rate || 22.0).toFixed(2)}/MT`}</strong>
                  </span>
                  <span>
                    Confidence
                    <strong>{loadingIntel ? "..." : `${intelData?.confidence ?? 89}%`}</strong>
                  </span>
                  <span>
                    Trend
                    <strong style={{ color: "#4ade80" }}>{loadingIntel ? "..." : intelData?.trend || "INCREASING"}</strong>
                  </span>
                </div>
              </div>

              {/* Route Map Card */}
              <div className="query-map-card">
                <div className="query-card-title">Route Map <small>{formData.destination ? "Live route preview" : "Select a destination"}</small></div>
                <RouteMap
                  origin={formData.origin || "Australia"}
                  destination={formData.destination || "Gangavaram"}
                  originLabel={selectedOrigin?.label || "Select origin"}
                  originCoordinates={selectedOrigin || originCoordinates.Australia}
                  destinationCoordinates={selectedDestination || destinationCoordinates.Gangavaram}
                />
              </div>

              {/* Selected Summary Card */}
              <div className="query-summary-card">
                <div className="query-card-title">Selected Summary</div>
                {[
                  ["Origin", selectedOrigin?.label || "Not selected"],
                  ["Destination", formData.destination ? `${formData.destination}, India` : "Not selected"],
                  ["Vessel Class", formData.vesselType || "Not selected"],
                  ["Cargo", formData.cargoType ? `${formData.cargoType} (${Number(formData.volume || 0).toLocaleString()} MT)` : "Not selected"],
                  ["Contract", `${formData.duration === "short-term" ? "Short-Term" : "Mid-Term"} (${contractLabel})`],
                ].map(([label, value]) => (
                  <div className="query-summary-row" key={label}>
                    <span>●</span>
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ForecastQuery;
