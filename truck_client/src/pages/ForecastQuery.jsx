import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RouteMap from "../components/RouteMap";
import { normalizeForecastResponse } from "../utils/forecastNormalizer";

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
    origin: "",
    destination: "",
    vesselType: "",
    cargoType: "",
    volume: "",
    duration: "short-term",
  });

  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const selectedOrigin = originCoordinates[formData.origin];
  const selectedDestination = destinationCoordinates[formData.destination];
  const selectedVessel = vesselOptions.find((vessel) => vessel.type === formData.vesselType);
  const contractLabel = formData.duration === "short-term" ? "1 – 3 Months" : formData.duration === "mid-term" ? "4 – 12 Months" : "12+ Months";
  const forecastPeriod = useMemo(() => formData.duration === "short-term" ? "Next 30 Days" : "Next 90 Days", [formData.duration]);
  const horizonDays = useMemo(() => formData.duration === "mid-term" ? 90 : 30, [formData.duration]);

  // Synchronize live preview whenever route or vessel parameters change
  useEffect(() => {
    if (!formData.origin || !formData.destination || !formData.vesselType) {
      setPreviewData(null);
      setLoadingPreview(false);
      setPreviewError(null);
      return;
    }

    let isCancelled = false;
    setLoadingPreview(true);
    setPreviewError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:7000"}/api/forecast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: formData.origin,
            destination: formData.destination,
            vesselType: formData.vesselType,
            cargoQuantity: formData.volume || 75000,
            forecastPeriod,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch forecast preview");
        }

        const rawData = await res.json();
        if (!isCancelled) {
          const normalized = normalizeForecastResponse(rawData);
          setPreviewData(normalized);
          setLoadingPreview(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn("Forecast preview error:", err.message);
          setPreviewError("Forecast unavailable");
          setLoadingPreview(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [formData.origin, formData.destination, formData.vesselType, formData.volume, forecastPeriod]);

  // Calculate dynamic mini chart bar heights reflecting actual forecast trajectory
  const miniBarHeights = useMemo(() => {
    if (loadingPreview) {
      return [35, 55, 45, 65, 55];
    }

    if (!previewData?.estimatedRate) {
      // Neutral initial placeholder bars
      return [45, 45, 45, 45, 45];
    }

    const trend = previewData.trend || "Stable";

    if (previewData.chartData && previewData.chartData.length >= 5) {
      const points = previewData.chartData.slice(-5).map((p) => {
        const val = Number(p.projectedRate ?? p.historicalRate ?? previewData.estimatedRate ?? 20);
        return isNaN(val) ? 20 : val;
      });

      const minVal = Math.min(...points);
      const maxVal = Math.max(...points);
      const diff = maxVal - minVal;

      if (diff > 0.1) {
        return points.map((val) => Math.round(25 + ((val - minVal) / diff) * 68));
      }
    }

    if (trend === "Increasing") {
      return [28, 45, 62, 78, 94];
    }
    if (trend === "Decreasing") {
      return [94, 78, 62, 45, 28];
    }
    return [55, 58, 56, 59, 57];
  }, [previewData, loadingPreview]);

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
                    <select className="form-select bg-dark text-white" style={{ borderColor: "#162234" }} name="cargoType" value={formData.cargoType} onChange={handleChange} required>
                      <option value="">Select Cargo</option>
                      <option value="Thermal Coal">Thermal Coal</option>
                      <option value="Coking Coal">Coking Coal</option>
                      <option value="PCI Coal">PCI Coal</option>
                      <option value="Anthracite Coal">Anthracite Coal</option>
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
              {/* EXACT QUICK FORECAST PREVIEW CARD (CONNECTED TO LIVE ML PIPELINE) */}
              <div className="query-preview-card">
                <div className="query-preview-heading">
                  <div>
                    <small>QUICK FORECAST PREVIEW</small>
                    <strong>
                      {loadingPreview
                        ? "..."
                        : previewError
                        ? "Forecast unavailable"
                        : previewData?.estimatedRate
                        ? `$${previewData.estimatedRate.toFixed(2)} / MT`
                        : "— / MT"}
                    </strong>
                    <span>
                      {loadingPreview
                        ? `Generating forecast · ${forecastPeriod}`
                        : previewError
                        ? "Unable to generate projection"
                        : `Estimated rate · ${forecastPeriod}`}
                    </span>
                  </div>
                  <b>AI-Powered</b>
                </div>

                {/* Mini Bar Chart Visualization (Live Trajectory) */}
                <div className="query-mini-chart">
                  {miniBarHeights.map((h, i) => (
                    <span key={i} style={{ height: `${h}%` }}></span>
                  ))}
                </div>

                {/* Stats Row */}
                <div className="query-preview-stats">
                  <span>
                    {`${horizonDays} Days`}
                    <strong>
                      {loadingPreview
                        ? "..."
                        : previewError
                        ? "—"
                        : formData.duration === "mid-term" && previewData?.forecast90Rate
                        ? `$${previewData.forecast90Rate.toFixed(2)} / MT`
                        : previewData?.estimatedRate
                        ? `$${previewData.estimatedRate.toFixed(2)} / MT`
                        : "—"}
                    </strong>
                  </span>
                  <span>
                    Confidence
                    <strong>
                      {loadingPreview
                        ? "..."
                        : previewError
                        ? "—"
                        : previewData?.confidence != null
                        ? `${previewData.confidence}% Confidence`
                        : "—"}
                    </strong>
                  </span>
                  <span>
                    Trend
                    <strong>
                      {loadingPreview
                        ? "..."
                        : previewError
                        ? "—"
                        : previewData?.trend
                        ? previewData.trend
                        : "—"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Route Map Card */}
              <div className="query-map-card">
                <div className="query-card-title">Route Map <small>{formData.destination ? "Live route preview" : "Select a destination"}</small></div>
                <RouteMap
                  origin={formData.origin || "Australia"}
                  destination={formData.destination || "Paradip"}
                  originLabel={selectedOrigin?.label || "Select origin"}
                  originCoordinates={selectedOrigin || originCoordinates.Australia}
                  destinationCoordinates={selectedDestination || destinationCoordinates.Paradip}
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
