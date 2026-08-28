import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RouteMap from "../components/RouteMap";
import { ports, vesselTypes } from "../data/Ports";
import RateChart from "./RateChart";

// Reuse the same vessel images used on the query page
import handysizeImg from "../assets/screenshot-2026-08-26_18-06-21.png";
import supramaxImg from "../assets/screenshot-2026-08-26_18-13-33.png";
import panamaxImg from "../assets/screenshot-2026-08-26_18-14-46.png";
import capesizeImg from "../assets/screenshot-2026-08-26_18-21-30.png";

const vesselImages = {
  Handysize: handysizeImg,
  Supramax: supramaxImg,
  Panamax: panamaxImg,
  Capesize: capesizeImg,
};

// Approximate representative export-hub coordinates per origin country
// (adjust these to the actual load ports you care about)
const ORIGIN_COORDINATES = {
  Australia: { lat: -32.9267, lng: 151.7817, label: "Newcastle (Port of Newcastle), Australia" },
  "Newcastle (Port of Newcastle), Australia": { lat: -32.9267, lng: 151.7817, label: "Newcastle (Port of Newcastle), Australia" },
  "Gladstone, Australia": { lat: -23.8427, lng: 151.2555, label: "Gladstone, Australia" },
  "United States": { lat: 36.9472, lng: -76.3283, label: "Hampton Roads/Norfolk, USA" },
  "Hampton Roads/Norfolk, USA": { lat: 36.9472, lng: -76.3283, label: "Hampton Roads/Norfolk, USA" },
  "Baltimore, USA": { lat: 39.2904, lng: -76.6122, label: "Baltimore, USA" },
  Mozambique: { lat: -14.5428, lng: 40.6728, label: "Nacala, Mozambique" },
  "Nacala, Mozambique": { lat: -14.5428, lng: 40.6728, label: "Nacala, Mozambique" },
  Russia: { lat: 42.7333, lng: 133.0833, label: "Vostochny, Russia" },
  "Vostochny, Russia": { lat: 42.7333, lng: 133.0833, label: "Vostochny, Russia" },
  Indonesia: { lat: -3.7000, lng: 114.4667, label: "Taboneo Anchorage (S. Kalimantan), Indonesia" },
  "Taboneo Anchorage (S. Kalimantan), Indonesia": { lat: -3.7000, lng: 114.4667, label: "Taboneo Anchorage (S. Kalimantan), Indonesia" },
};

// Coordinates for the East Coast India ports, keyed by port.id from Ports.jsx
const PORT_COORDINATES = {
  paradip: { lat: 20.2648, lng: 86.6947 },
  gangavaram: { lat: 17.6167, lng: 83.2333 },
  gopalpur: { lat: 19.2647, lng: 84.9089 },
  dhamra: { lat: 20.7833, lng: 86.9833 },
  haldia: { lat: 22.0333, lng: 88.0833 },
  vizag: { lat: 17.6868, lng: 83.2185 },
  "sagar-sandheads": { lat: 21.6500, lng: 88.0500 },
};

// Haversine great-circle distance in nautical miles + km
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R_KM = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R_KM * c;
  const nauticalMiles = km * 0.539957;

  return { km, nauticalMiles };
}

// Helper to find a destination port entry by name (matches the "name" or "id" field)
function findPortByDestination(destinationName) {
  if (!destinationName) return null;
  const normalized = destinationName.toLowerCase().trim();
  return (
    ports.find(
      (p) =>
        p.name.toLowerCase().includes(normalized) ||
        p.id.toLowerCase() === normalized.replace(/\s+/g, "-")
    ) || null
  );
}

// Simple inline spinner — no external library needed
const Spinner = ({ size = 40 }) => (
  <>
    <div
      style={{
        width: size,
        height: size,
        border: "3px solid #162234",
        borderTopColor: "#38bdf8",
        borderRadius: "50%",
        animation: "forecast-spin 0.8s linear infinite",
        margin: "0 auto",
      }}
    />
    <style>{`
      @keyframes forecast-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </>
);

const ForecastResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const query = location.state || {};

  const {
    origin = "Australia",
    destination = "Paradip",
    vesselType = "Capesize",
    cargoType = "Coal",
    cargoQuantity = 100000,
    forecastPeriod = "Next 30 Days",
  } = query;

  // VESSEL METRICS LOOKUP
  const vesselSpecs = useMemo(() => {
    const found = vesselTypes.find(
      (v) => v.type.toLowerCase() === vesselType.toLowerCase()
    );
    return (
      found || {
        type: vesselType,
        maxDWT: 80000,
        maxLOA: 229,
        maxBeam: 32.2,
        maxDraft: 14.5,
      }
    );
  }, [vesselType]);

  const vesselImage = vesselImages[vesselSpecs.type] || vesselImages[vesselType];
  const destinationPort = findPortByDestination(destination);
  const originCoordinates = ORIGIN_COORDINATES[origin];
  const destinationCoordinates = destinationPort ? PORT_COORDINATES[destinationPort.id] : null;

  // PORT INFRASTRUCTURE COMPATIBILITY ENGINE
  const portResults = useMemo(() => {
    return ports.map((port) => {
      const restrictions = [];

      if (port.maxDraft !== null && vesselSpecs.maxDraft > port.maxDraft) {
        restrictions.push(`Draft (${vesselSpecs.maxDraft}m) exceeds ${port.maxDraft}m limit`);
      }

      if (port.maxLOA !== null && vesselSpecs.maxLOA > port.maxLOA) {
        restrictions.push(`LOA (${vesselSpecs.maxLOA}m) exceeds ${port.maxLOA}m limit`);
      }

      if (port.maxBeam !== null && vesselSpecs.maxBeam > port.maxBeam) {
        restrictions.push(`Beam (${vesselSpecs.maxBeam}m) exceeds ${port.maxBeam}m limit`);
      }

      if (port.maxDWT !== null && vesselSpecs.maxDWT > port.maxDWT) {
        restrictions.push(`DWT exceeds ${port.maxDWT.toLocaleString()} tons limit`);
      }

      if (port.id === "sagar-sandheads") {
        return {
          ...port,
          status: "special",
          restrictions: [
            "Deep-water anchorage operational site",
            "STS (Ship-to-Ship) transfer operation required",
          ],
        };
      }

      return {
        ...port,
        status: restrictions.length === 0 ? "compatible" : "restricted",
        restrictions,
      };
    });
  }, [vesselSpecs]);

  const compatiblePorts = portResults.filter((p) => p.status === "compatible");
  const restrictedPorts = portResults.filter((p) => p.status === "restricted");
  const specialPorts = portResults.filter((p) => p.status === "special");

  // DISTANCE CALCULATION (origin country -> destination port)
  const distanceInfo = useMemo(() => {
    const originCoords = ORIGIN_COORDINATES[origin];
    const destinationPort = findPortByDestination(destination);
    const destCoords = destinationPort ? PORT_COORDINATES[destinationPort.id] : null;

    if (!originCoords || !destCoords) return null;

    const { km, nauticalMiles } = haversineDistance(
      originCoords.lat,
      originCoords.lng,
      destCoords.lat,
      destCoords.lng
    );

    return {
      km: Math.round(km),
      nauticalMiles: Math.round(nauticalMiles),
      originLabel: originCoords.label,
    };
  }, [origin, destination]);

  // MARKET / RATE ANALYSIS
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [analysisError, setAnalysisError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchForecast = async () => {
      setLoadingAnalysis(true);
      setAnalysisError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:7000"}/api/forecast`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({
            origin,
            destination,
            vesselType,
            cargoQuantity,
            forecastPeriod,
            compatiblePorts,
            restrictedPorts,
          }),
        });

        if (!res.ok) {
          let serverMessage = `Forecast request failed (${res.status})`;
          try {
            const errorBody = await res.json();
            serverMessage = errorBody.error || errorBody.message || serverMessage;
          } catch {
            // Keep the HTTP status when the server has no JSON error body.
          }
          if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
          }
          throw new Error(serverMessage);
        }

        const data = await res.json();
        if (!cancelled) setAnalysis(data);
      } catch (err) {
        if (!cancelled) {
          setAnalysisError(
            err.message === "Failed to fetch"
              ? "Unable to reach the forecast service. Please check your connection and try again."
              : err.message || "Failed to generate forecast"
          );
          setAnalysis(null);
        }
      } finally {
        if (!cancelled) setLoadingAnalysis(false);
      }
    };

    fetchForecast();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, vesselType, cargoQuantity, forecastPeriod, retryCount]);

  const handleRetry = () => setRetryCount((c) => c + 1);

  const specMetrics = [
    {
      icon: "🚢",
      title: "Deadweight",
      value: `${vesselSpecs.maxDWT.toLocaleString()} DWT`,
    },
    {
      icon: "📏",
      title: "Maximum LOA",
      value: `${vesselSpecs.maxLOA} m`,
    },
    {
      icon: "↔️",
      title: "Maximum Beam",
      value: `${vesselSpecs.maxBeam} m`,
    },
    {
      icon: "⚓",
      title: "Maximum Draft",
      value: `${vesselSpecs.maxDraft} m`,
    },
  ];

  return (
    <main
      className={`min-vh-100 d-flex flex-column text-white results-page dashboard-shell ${sidebarOpen ? "sidebar-open" : ""}`}
      style={{
        backgroundColor: "#070d18",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand"><span className="dashboard-brand-mark">B</span><span><strong>Butter Freight</strong><small>Intelligent chartering</small></span></div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <a className="dashboard-nav-link active" href="#dashboard-overview">⌂ <span>Overview</span></a>
          <a className="dashboard-nav-link" href="#market-analysis">▦ <span>Market Snapshot</span></a>
          <a className="dashboard-nav-link" href="#rate-trend">⌁ <span>Forecasts</span></a>
          <a className="dashboard-nav-link" href="#vessel-profile">▣ <span>Vessels</span></a>
          <a className="dashboard-nav-link" href="#port-analysis">◇ <span>Ports</span></a>
          <a className="dashboard-nav-link" href="#recommendation">! <span>Recommendations</span></a>
        </nav>
        <div className="sidebar-note"><strong>AI Co-Pilot</strong><p>Ask anything about routes, markets or vessels.</p><button className="btn" type="button" onClick={() => document.getElementById("recommendation")?.scrollIntoView({ behavior: "smooth" })}>✦ Ask AI</button></div>
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-topbar"><button className="sidebar-toggle" type="button" aria-label="Toggle navigation" onClick={() => setSidebarOpen((open) => !open)}>☰</button><button className="dashboard-back" type="button" onClick={() => navigate(-1)}>← <span>Back</span></button><span className="topbar-title">Decision cockpit</span><div className="topbar-actions"><span>◷ May 26, 2025</span><span className="avatar">SS</span><strong>{JSON.parse(localStorage.getItem("user") || "{}").fullName || "Operator"}</strong></div></header>
      <Navbar />

      {/* HERO SECTION */}
      <section id="dashboard-overview" className="py-5 dashboard-overview">
        <div className="container py-4 py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span
                className="badge rounded-pill px-3 py-2 mb-3 fw-semibold"
                style={{ backgroundColor: "#0b2528", color: "#38bdf8" }}
              >
                AI-GENERATED FORECAST RESULTS
              </span>

              <h1 className="display-4 fw-bold text-white">
                Freight & Vessel
                <br />
                <span style={{ color: "#38bdf8" }}>
                  Decision Intelligence
                </span>
              </h1>

              <p className="lead mt-3" style={{ color: "#8492a6" }}>
                AI-assisted analysis of freight conditions, vessel suitability,
                and East Coast port infrastructure for your charter scenario.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-2 mt-4">
                <span
                  className="badge rounded-pill px-3 py-2 fs-6 fw-normal"
                  style={{
                    backgroundColor: "#0b1320",
                    color: "#e2e8f0",
                    border: "1px solid #162234",
                  }}
                >
                  {analysis?.origin || origin}
                </span>

                <span className="fw-bold" style={{ color: "#38bdf8" }}>
                  →
                </span>

                <span
                  className="badge rounded-pill px-3 py-2 fs-6 fw-normal"
                  style={{
                    backgroundColor: "#0b1320",
                    color: "#e2e8f0",
                    border: "1px solid #162234",
                  }}
                >
                  {analysis?.destination || destination}
                </span>

                <span
                  className="badge rounded-pill px-3 py-2 fs-6 fw-semibold"
                  style={{
                    backgroundColor: "#1e88e5",
                    color: "#ffffff",
                  }}
                >
                  {vesselType}
                </span>

                {distanceInfo && (
                  <span
                    className="badge rounded-pill px-3 py-2 fs-6 fw-normal"
                    style={{
                      backgroundColor: "#0b1320",
                      color: "#38bdf8",
                      border: "1px solid #162234",
                    }}
                  >
                    ~{distanceInfo.nauticalMiles.toLocaleString()} nm
                  </span>
                )}
              </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="col-lg-5">
              <div
                className="card border-0 shadow-lg rounded-4 p-2"
                style={{
                  backgroundColor: "#0b1320",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4 p-md-5">
                  <small
                    className="text-uppercase fw-bold tracking-wider"
                    style={{ color: "#64748b", fontSize: "0.75rem" }}
                  >
                    FORECAST SCENARIO
                  </small>

                  <h4 className="fw-bold mt-2 mb-4 text-white">
                    {vesselType} Charter Analysis
                  </h4>

                  {/* Vessel image */}
                  {vesselImage && (
                    <div
                      className="rounded-3 mb-4 d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: "#070d18",
                        border: "1px solid #162234",
                        padding: "1rem",
                      }}
                    >
                      <img
                        src={vesselImage}
                        alt={vesselType}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  )}

                  <div className="d-flex flex-column gap-3">
                    <div
                      className="d-flex justify-content-between pb-3"
                      style={{ borderBottom: "1px solid #162234" }}
                    >
                      <span style={{ color: "#8492a6" }}>Cargo</span>
                      <strong className="text-white">
                        {Number(cargoQuantity).toLocaleString()} MT ({cargoType})
                      </strong>
                    </div>

                    <div
                      className="d-flex justify-content-between pb-3"
                      style={{ borderBottom: "1px solid #162234" }}
                    >
                      <span style={{ color: "#8492a6" }}>Forecast</span>
                      <strong className="text-white">{forecastPeriod}</strong>
                    </div>

                    <div
                      className="d-flex justify-content-between pb-3"
                      style={{ borderBottom: "1px solid #162234" }}
                    >
                      <span style={{ color: "#8492a6" }}>Vessel</span>
                      <strong className="text-white">{vesselType}</strong>
                    </div>

                    <div
                      className="d-flex justify-content-between pb-3"
                      style={{ borderBottom: "1px solid #162234" }}
                    >
                      <span style={{ color: "#8492a6" }}>Approx. Distance</span>
                      <strong className="text-white">
                        {distanceInfo
                          ? `${distanceInfo.km.toLocaleString()} km / ${distanceInfo.nauticalMiles.toLocaleString()} nm`
                          : "N/A"}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ color: "#8492a6" }}>
                        Compatible Ports
                      </span>
                      <strong
                        className="fs-4 fw-bold"
                        style={{ color: "#38bdf8" }}
                      >
                        {compatiblePorts.length} / {ports.length}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="route-snapshot-section py-4">
        <div className="container">
          <div className="route-snapshot card border-0 rounded-4 p-3">
            <div className="route-snapshot-heading"><div><small className="eyebrow">FREIGHT MARKET SNAPSHOT</small><h3>{origin} <span>→</span> {destination}</h3></div><span className="status-pill">● Forecast Stable</span></div>
            <div className="route-snapshot-grid"><div className="route-facts"><div className="route-line"><span className="route-dot sage-dot"></span><div><small>Loading Port</small><strong>{originCoordinates?.label || origin}</strong></div><span className="route-vessel">▣ {vesselType}</span><div className="route-arrow">→</div><span className="route-dot coral-dot"></span><div><small>Discharge Port</small><strong>{destination}, India</strong></div></div><div className="route-kpis"><div><small>Vessel Type</small><strong>{vesselType}</strong></div><div><small>Cargo</small><strong>{Number(cargoQuantity).toLocaleString()} MT</strong></div><div><small>Laycan Window</small><strong>{forecastPeriod}</strong></div><div><small>Risk Level</small><strong>{analysis?.forecast?.riskLevel || "Pending"}</strong></div></div></div><div className="route-map-panel"><RouteMap origin={origin} destination={destination} originLabel={originCoordinates?.label} originCoordinates={originCoordinates} destinationCoordinates={destinationCoordinates} /></div></div>
          </div>
        </div>
      </section>

      {/* MARKET ANALYSIS */}
      <section id="market-analysis"
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              MARKET ANALYSIS ENGINE
            </small>

            <h2 className="fw-bold mt-2 text-white">Freight Market Outlook</h2>

            <p style={{ color: "#8492a6" }}>
              AI-generated freight market assessment and rate projections for the selected trade lane.
            </p>
          </div>

          {loadingAnalysis && (
            <div className="text-center py-5">
              <Spinner size={44} />
              <div className="mt-3" style={{ color: "#8492a6" }}>
                Generating forecast…
              </div>
            </div>
          )}

          {analysisError && !loadingAnalysis && (
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div
                  className="card border-0 rounded-4 text-center p-2"
                  style={{
                    backgroundColor: "#070d18",
                    border: "1px solid #3f1d1d",
                  }}
                >
                  <div className="card-body p-4 p-md-5">
                    <div className="fs-1 mb-3">⚠️</div>
                    <h5 className="fw-bold text-white mb-2">
                      Forecast Unavailable
                    </h5>
                    <p className="mb-4" style={{ color: "#8492a6" }}>
                      {analysisError}
                    </p>
                    <button
                      className="btn fw-semibold px-4 py-2 rounded-3 text-white"
                      style={{ backgroundColor: "#1e88e5" }}
                      onClick={handleRetry}
                    >
                      ↻ Retry Forecast
                    </button>
                    <p className="small mt-3 mb-0" style={{ color: "#64748b" }}>
                      Port compatibility and vessel specs below are still available offline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {analysis && !loadingAnalysis && !analysisError && (
            <>
              <div className="row g-4">
                <div className="col-md-4">
                  <div
                    className="card border-0 rounded-4 h-100 p-2"
                    style={{
                      backgroundColor: "#070d18",
                      border: "1px solid #162234",
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="fs-2 mb-2">💰</div>
                      <small style={{ color: "#8492a6" }}>
                        Forecast Freight Rate
                      </small>
                      <h2 className="fw-bold mt-2 text-white">
                        ${analysis.forecast?.predictedRate ?? "N/A"}/tonne
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className="card border-0 rounded-4 h-100 p-2"
                    style={{
                      backgroundColor: "#070d18",
                      border: "1px solid #162234",
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="fs-2 mb-2">📈</div>
                      <small style={{ color: "#8492a6" }}>Market Trend</small>
                      <h4 className="fw-bold mt-2 text-white">
                        {analysis.forecast?.marketTrend ?? "N/A"}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className="card border-0 rounded-4 h-100 p-2"
                    style={{
                      backgroundColor: "#070d18",
                      border: "1px solid #162234",
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="fs-2 mb-2">⚠️</div>
                      <small style={{ color: "#8492a6" }}>Market Risk</small>
                      <h4 className="fw-bold mt-2 text-white">
                        {analysis.forecast?.riskLevel ?? "N/A"}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* MARKET & PORT INTELLIGENCE CARDS */}
              {analysis && (analysis.market_intelligence || analysis.forecast?.market_intelligence) && (
                <div className="mt-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#0284c7", fontSize: "0.75rem" }}>
                        LIVE MARKET & PORT INDICATORS
                      </small>
                      <h4 className="fw-bold mt-1 mb-0" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1c1917" }}>
                        Market & Port Intelligence
                      </h4>
                    </div>
                  </div>

                  <div className="row g-4">
                    {/* 1. Demand Card */}
                    <div className="col-md-3">
                      <div className="card border-0 rounded-4 h-100 p-2 shadow-sm" style={{ backgroundColor: "#fafaf9", border: "1px solid #e7e5e4" }}>
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fs-3">📊</span>
                            <span
                              className="badge rounded-pill px-2.5 py-1 fw-bold"
                              style={{
                                backgroundColor: (analysis.market_intelligence?.demand_status || analysis.forecast?.market_intelligence?.demand_status) === "High" ? "#dcfce7" : (analysis.market_intelligence?.demand_status || analysis.forecast?.market_intelligence?.demand_status) === "Low" ? "#fee2e2" : "#e0f2fe",
                                color: (analysis.market_intelligence?.demand_status || analysis.forecast?.market_intelligence?.demand_status) === "High" ? "#15803d" : (analysis.market_intelligence?.demand_status || analysis.forecast?.market_intelligence?.demand_status) === "Low" ? "#b91c1c" : "#0369a1",
                                border: `1px solid ${(analysis.market_intelligence?.demand_status || analysis.forecast?.market_intelligence?.demand_status) === "High" ? "#86efac" : (analysis.market_intelligence?.demand_status || analysis.forecast?.market_intelligence?.demand_status) === "Low" ? "#fca5a5" : "#bae6fd"}`,
                              }}
                            >
                              {analysis.market_intelligence?.demand_status || analysis.forecast?.market_intelligence?.demand_status || "Normal"}
                            </span>
                          </div>
                          <small style={{ color: "#64748b", fontWeight: "600" }}>Cargo Demand</small>
                          <h4 className="fw-bold mt-1 mb-0" style={{ color: "#0f172a" }}>
                            {analysis.market_intelligence?.demand_index || analysis.forecast?.market_intelligence?.demand_index || "100.1"} <span className="fs-6 text-muted fw-normal">Index</span>
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* 2. Vessel Supply Card */}
                    <div className="col-md-3">
                      <div className="card border-0 rounded-4 h-100 p-2 shadow-sm" style={{ backgroundColor: "#fafaf9", border: "1px solid #e7e5e4" }}>
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fs-3">🚢</span>
                            <span
                              className="badge rounded-pill px-2.5 py-1 fw-bold"
                              style={{
                                backgroundColor: (analysis.market_intelligence?.supply_status || analysis.forecast?.market_intelligence?.supply_status) === "Tight" ? "#fee2e2" : (analysis.market_intelligence?.supply_status || analysis.forecast?.market_intelligence?.supply_status) === "Excess" ? "#e0f2fe" : "#dcfce7",
                                color: (analysis.market_intelligence?.supply_status || analysis.forecast?.market_intelligence?.supply_status) === "Tight" ? "#b91c1c" : (analysis.market_intelligence?.supply_status || analysis.forecast?.market_intelligence?.supply_status) === "Excess" ? "#0369a1" : "#15803d",
                                border: `1px solid ${(analysis.market_intelligence?.supply_status || analysis.forecast?.market_intelligence?.supply_status) === "Tight" ? "#fca5a5" : (analysis.market_intelligence?.supply_status || analysis.forecast?.market_intelligence?.supply_status) === "Excess" ? "#bae6fd" : "#86efac"}`,
                              }}
                            >
                              {analysis.market_intelligence?.supply_status || analysis.forecast?.market_intelligence?.supply_status || "Balanced"}
                            </span>
                          </div>
                          <small style={{ color: "#64748b", fontWeight: "600" }}>Vessel Supply</small>
                          <h4 className="fw-bold mt-1 mb-0" style={{ color: "#0f172a" }}>
                            {analysis.market_intelligence?.vessel_supply_index || analysis.forecast?.market_intelligence?.vessel_supply_index || "100.4"} <span className="fs-6 text-muted fw-normal">Index</span>
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* 3. Port Congestion Card */}
                    <div className="col-md-3">
                      <div className="card border-0 rounded-4 h-100 p-2 shadow-sm" style={{ backgroundColor: "#fafaf9", border: "1px solid #e7e5e4" }}>
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fs-3">⚓</span>
                            <span
                              className="badge rounded-pill px-2.5 py-1 fw-bold"
                              style={{
                                backgroundColor: (analysis.port_analysis?.congestion_level || analysis.forecast?.port_analysis?.congestion_level) === "Low" ? "#dcfce7" : (analysis.port_analysis?.congestion_level || analysis.forecast?.port_analysis?.congestion_level) === "High" ? "#fee2e2" : "#fef3c7",
                                color: (analysis.port_analysis?.congestion_level || analysis.forecast?.port_analysis?.congestion_level) === "Low" ? "#15803d" : (analysis.port_analysis?.congestion_level || analysis.forecast?.port_analysis?.congestion_level) === "High" ? "#b91c1c" : "#b45309",
                                border: `1px solid ${(analysis.port_analysis?.congestion_level || analysis.forecast?.port_analysis?.congestion_level) === "Low" ? "#86efac" : (analysis.port_analysis?.congestion_level || analysis.forecast?.port_analysis?.congestion_level) === "High" ? "#fca5a5" : "#fde68a"}`,
                              }}
                            >
                              {analysis.port_analysis?.congestion_level || analysis.forecast?.port_analysis?.congestion_level || "Medium"}
                            </span>
                          </div>
                          <small style={{ color: "#64748b", fontWeight: "600" }}>Port Congestion</small>
                          <h4 className="fw-bold mt-1 mb-0" style={{ color: "#0f172a" }}>
                            {analysis.port_analysis?.congestion_index || analysis.forecast?.port_analysis?.congestion_index || "35.2"} <span className="fs-6 text-muted fw-normal">Score</span>
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* 4. Estimated Delay Card */}
                    <div className="col-md-3">
                      <div className="card border-0 rounded-4 h-100 p-2 shadow-sm" style={{ backgroundColor: "#fafaf9", border: "1px solid #e7e5e4" }}>
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fs-3">⏱️</span>
                            <span
                              className="badge rounded-pill px-2.5 py-1 fw-bold"
                              style={{
                                backgroundColor: (analysis.port_analysis?.delay_level || analysis.forecast?.port_analysis?.delay_level) === "Low" ? "#dcfce7" : (analysis.port_analysis?.delay_level || analysis.forecast?.port_analysis?.delay_level) === "High" ? "#fee2e2" : "#fef3c7",
                                color: (analysis.port_analysis?.delay_level || analysis.forecast?.port_analysis?.delay_level) === "Low" ? "#15803d" : (analysis.port_analysis?.delay_level || analysis.forecast?.port_analysis?.delay_level) === "High" ? "#b91c1c" : "#b45309",
                                border: `1px solid ${(analysis.port_analysis?.delay_level || analysis.forecast?.port_analysis?.delay_level) === "Low" ? "#86efac" : (analysis.port_analysis?.delay_level || analysis.forecast?.port_analysis?.delay_level) === "High" ? "#fca5a5" : "#fde68a"}`,
                              }}
                            >
                              {analysis.port_analysis?.delay_level || analysis.forecast?.port_analysis?.delay_level || "Medium"} Delay
                            </span>
                          </div>
                          <small style={{ color: "#64748b", fontWeight: "600" }}>Estimated Wait Time</small>
                          <h4 className="fw-bold mt-1 mb-0" style={{ color: "#0f172a" }}>
                            ~{analysis.port_analysis?.estimated_delay_days || analysis.forecast?.port_analysis?.estimated_delay_days || "2.2"} <span className="fs-6 text-muted fw-normal">Days</span>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OPTIMAL PORT RECOMMENDATION ENGINE */}
              {analysis && (analysis.optimal_port || analysis.forecast?.optimal_port) && (() => {
                const opt = analysis.optimal_port || analysis.forecast?.optimal_port;
                const isOptimal = opt.recommendation_type === "Keep Selected Port" || opt.recommended_port === opt.selected_port;

                return (
                  <div className="card border-0 rounded-4 mt-4 p-2 shadow-sm" style={{ backgroundColor: "#fafaf9", border: "1px solid #e7e5e4" }}>
                    <div className="card-body p-4 p-md-5">
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                        <div>
                          <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#0284c7", fontSize: "0.75rem" }}>
                            PORT OPTIMIZATION & DISCHARGE ADVICE
                          </small>
                          <h3 className="fw-bold mt-1 mb-0" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1c1917" }}>
                            🏆 Optimal Discharge Port Recommendation
                          </h3>
                        </div>
                        <span className={`badge rounded-pill px-3 py-2 fs-6 fw-bold ${isOptimal ? "bg-success text-white" : "bg-warning text-dark"}`}>
                          {opt.recommendation_type}
                        </span>
                      </div>

                      {/* Highlight Recommendation Card */}
                      <div className="p-4 rounded-4 mb-4" style={{ backgroundColor: isOptimal ? "#f0fdf4" : "#fffbeb", border: `1px solid ${isOptimal ? "#86efac" : "#fde68a"}` }}>
                        <div className="row g-4 align-items-center">
                          <div className="col-12 col-lg-8">
                            <div className="d-flex align-items-center gap-3 mb-2">
                              <span className="fs-2 flex-shrink-0">🎯</span>
                              <div>
                                <h4 className="fw-bold mb-0" style={{ color: "#0f172a" }}>
                                  Recommended: <span style={{ color: "#0284c7" }}>{opt.recommended_port}</span>
                                </h4>
                                <small style={{ color: "#475569" }}>
                                  Selected Query Port: <strong style={{ color: "#0f172a" }}>{opt.selected_port}</strong>
                                </small>
                              </div>
                            </div>

                            <p className="mt-2 mb-0" style={{ color: "#334155", lineHeight: "1.6", fontSize: "0.95rem" }}>
                              {opt.reason}
                            </p>

                            <div
                              className="d-flex align-items-start gap-2 mt-3 p-2 px-3 rounded-3"
                              style={{
                                backgroundColor: "#e0f2fe",
                                border: "1px solid #bae6fd",
                                color: "#0369a1",
                                fontSize: "0.85rem",
                                lineHeight: "1.5",
                                maxWidth: "100%",
                              }}
                            >
                              <span className="flex-shrink-0">⚡</span>
                              <span className="fw-medium text-break">
                                <strong>Operational Benefit:</strong> {opt.expected_operational_benefit}
                              </span>
                            </div>
                          </div>

                          <div className="col-12 col-lg-4">
                            <div
                              className="p-3 rounded-4 text-center h-100 d-flex flex-column justify-content-center shadow-sm"
                              style={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                minWidth: "160px",
                              }}
                            >
                              <small style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
                                Optimization Score
                              </small>
                              <div className="d-flex align-items-baseline justify-content-center gap-1 my-1">
                                <span className="fw-bold" style={{ fontSize: "2.25rem", color: "#0284c7", lineHeight: "1" }}>
                                  {opt.optimization_score}
                                </span>
                                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>/ 100</span>
                              </div>
                              <small style={{ color: opt.congestion_level === "Low" ? "#15803d" : opt.congestion_level === "High" ? "#b91c1c" : "#b45309", fontSize: "0.82rem", fontWeight: "600" }}>
                                Est. Delay: ~{opt.estimated_delay_days}d ({opt.congestion_level} Congestion)
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multi-Factor Port Ranking Table */}
                      {opt.ranked_alternatives?.length > 0 && (
                        <div className="mt-4">
                          <h5 className="fw-bold mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1c1917" }}>
                            Multi-Factor Alternative Port Rankings
                          </h5>
                          <div className="table-responsive rounded-3" style={{ border: "1px solid #e2e8f0" }}>
                            <table className="table table-hover align-middle mb-0" style={{ backgroundColor: "#ffffff" }}>
                              <thead style={{ backgroundColor: "#f8fafc" }}>
                                <tr style={{ borderBottom: "2px solid #cbd5e1" }}>
                                  <th style={{ color: "#334155", fontWeight: "700", fontSize: "0.82rem", textTransform: "uppercase", padding: "12px 14px" }}>Rank</th>
                                  <th style={{ color: "#334155", fontWeight: "700", fontSize: "0.82rem", textTransform: "uppercase", padding: "12px 14px" }}>Port Name</th>
                                  <th style={{ color: "#334155", fontWeight: "700", fontSize: "0.82rem", textTransform: "uppercase", padding: "12px 14px" }}>Suitability Status</th>
                                  <th style={{ color: "#334155", fontWeight: "700", fontSize: "0.82rem", textTransform: "uppercase", padding: "12px 14px" }}>Congestion Index</th>
                                  <th style={{ color: "#334155", fontWeight: "700", fontSize: "0.82rem", textTransform: "uppercase", padding: "12px 14px" }}>Est. Delay</th>
                                  <th style={{ color: "#334155", fontWeight: "700", fontSize: "0.82rem", textTransform: "uppercase", padding: "12px 14px" }}>Score</th>
                                  <th style={{ color: "#334155", fontWeight: "700", fontSize: "0.82rem", textTransform: "uppercase", padding: "12px 14px" }}>Operational Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {opt.ranked_alternatives.map((alt) => {
                                  const isRec = alt.port === opt.recommended_port;
                                  const isSel = alt.is_selected;
                                  return (
                                    <tr key={alt.port} style={{
                                      backgroundColor: isRec ? "#f0fdf4" : isSel ? "#f0f9ff" : "#ffffff",
                                      borderBottom: "1px solid #e2e8f0"
                                    }}>
                                      <td style={{ padding: "12px 14px" }}>
                                        <span className="fw-bold" style={{ color: isRec ? "#d97706" : "#0f172a" }}>
                                          {isRec ? "🥇 #1" : `#${alt.rank}`}
                                        </span>
                                      </td>
                                      <td style={{ padding: "12px 14px" }}>
                                        <span className="fw-bold" style={{ color: "#0f172a", fontSize: "0.95rem" }}>{alt.port}</span>
                                        {isRec && <span className="badge rounded-pill bg-warning text-dark ms-2 fw-semibold px-2 py-1">Recommended</span>}
                                        {isSel && <span className="badge rounded-pill bg-info text-dark ms-2 fw-semibold px-2 py-1">Selected</span>}
                                      </td>
                                      <td style={{ padding: "12px 14px" }}>
                                        <span
                                          className="badge rounded-pill px-2.5 py-1.5 fw-bold"
                                          style={{
                                            backgroundColor: alt.status === "compatible" ? "#dcfce7" : alt.status === "special" ? "#fef3c7" : "#fee2e2",
                                            color: alt.status === "compatible" ? "#15803d" : alt.status === "special" ? "#b45309" : "#b91c1c",
                                            border: `1px solid ${alt.status === "compatible" ? "#86efac" : alt.status === "special" ? "#fde68a" : "#fca5a5"}`,
                                            fontSize: "0.8rem",
                                          }}
                                        >
                                          {alt.status === "compatible" ? "✓ Compatible" : alt.status === "special" ? "⚓ STS Lightering" : "⚠ Restricted"}
                                        </span>
                                      </td>
                                      <td style={{ padding: "12px 14px" }}>
                                        <span className="fw-bold" style={{
                                          color: alt.congestion_level === "Low" ? "#15803d" : alt.congestion_level === "High" ? "#b91c1c" : "#b45309"
                                        }}>
                                          {alt.congestion_index} ({alt.congestion_level})
                                        </span>
                                      </td>
                                      <td style={{ padding: "12px 14px", color: "#0f172a", fontWeight: "600" }}>
                                        ~{alt.estimated_delay_days} days
                                      </td>
                                      <td style={{ padding: "12px 14px" }}>
                                        <span className="fw-bold" style={{ color: "#0284c7", fontSize: "1.05rem" }}>{alt.optimization_score}</span>
                                      </td>
                                      <td style={{ padding: "12px 14px", color: "#334155", fontSize: "0.88rem", maxWidth: "340px", lineHeight: "1.5" }}>
                                        {alt.reason}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div
                className="card border-0 rounded-4 mt-4 p-2"
                style={{
                  backgroundColor: "#070d18",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4 p-md-5">
                  <small
                    className="text-uppercase fw-bold tracking-wider"
                    style={{ color: "#38bdf8", fontSize: "0.75rem" }}
                  >
                    ANALYTICAL SUMMARY
                  </small>

                  <h4 className="fw-bold mt-2 text-white">
                    Market Assessment Summary
                  </h4>

                  <p className="mt-3 mb-0" style={{ color: "#8492a6", lineHeight: "1.7" }}>
                    {analysis.forecast?.summary || analysis.forecast?.reasoning}
                  </p>

                  {analysis.forecast?.keyFactors?.length > 0 && (
                    <ul className="mt-3" style={{ color: "#8492a6" }}>
                      {analysis.forecast.keyFactors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  )}

                  {analysis.forecast?.forecast30Day && analysis.forecast?.forecast90Day && (
                    <div className="forecast-table-wrap mt-4">
                      <div className="small fw-semibold mb-2" style={{ color: "#416b52" }}>Forecast at a glance</div>
                      <table className="forecast-table">
                        <tbody>
                          <tr><th>In 30 days</th><td>${analysis.forecast.forecast30Day.rate}/MT</td><td>${analysis.forecast.forecast30Day.lower} - ${analysis.forecast.forecast30Day.upper}/MT likely range</td></tr>
                          <tr><th>In 90 days</th><td>${analysis.forecast.forecast90Day.rate}/MT</td><td>${analysis.forecast.forecast90Day.lower} - ${analysis.forecast.forecast90Day.upper}/MT likely range</td></tr>
                          <tr><th>Market direction</th><td colSpan="2">{analysis.forecast.marketTrend || "Stable"}</td></tr>
                          <tr><th>Planning note</th><td colSpan="2">Use these ranges to compare a spot booking with a short- or medium-term contract.</td></tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FREIGHT RATE TREND CHART */}
      {analysis?.rateData?.length > 0 && !loadingAnalysis && !analysisError && (
        <section id="rate-trend" className="py-4">
          <div className="container py-2">
            <RateChart data={analysis.rateData} />
          </div>
        </section>
      )}

      {/* VESSEL PROFILE */}
      <section id="vessel-profile" className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              VESSEL PROFILE
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Selected Vessel Specifications
            </h2>

            <p style={{ color: "#8492a6" }}>
              Parameters evaluated against port draft and berth limits.
            </p>
          </div>

          <div className="row g-4 align-items-stretch">
            {vesselImage && (
              <div className="col-lg-4">
                <div
                  className="card border-0 rounded-4 h-100 p-2 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#0b1320",
                    border: "1px solid #162234",
                  }}
                >
                  <div className="card-body p-4 text-center">
                    <img
                      src={vesselImage}
                      alt={vesselType}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "contain",
                        marginBottom: "0.75rem",
                      }}
                    />
                    <h5 className="fw-bold text-white mb-0">{vesselType}</h5>
                  </div>
                </div>
              </div>
            )}

            <div className={vesselImage ? "col-lg-8" : "col-12"}>
              <div className="row g-4 h-100">
                {specMetrics.map((metric) => (
                  <div className="col-6" key={metric.title}>
                    <div
                      className="card border-0 rounded-4 h-100 p-2 text-center"
                      style={{
                        backgroundColor: "#0b1320",
                        border: "1px solid #162234",
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="fs-1 mb-2">{metric.icon}</div>
                        <small style={{ color: "#8492a6" }}>{metric.title}</small>
                        <h5 className="fw-bold mt-2 text-white">{metric.value}</h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORT INFRASTRUCTURE ANALYSIS */}
      <section id="port-analysis"
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              PORT INFRASTRUCTURE ANALYSIS
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Port Operation Compatibility
            </h2>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div
                className="card border-0 rounded-4 p-2"
                style={{
                  backgroundColor: "#070d18",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4">
                  <div className="fs-2 mb-2">✅</div>
                  <small style={{ color: "#8492a6" }}>Compatible</small>
                  <h2 className="fw-bold mt-1 text-success">
                    {compatiblePorts.length}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card border-0 rounded-4 p-2"
                style={{
                  backgroundColor: "#070d18",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4">
                  <div className="fs-2 mb-2">⚠️</div>
                  <small style={{ color: "#8492a6" }}>Restricted</small>
                  <h2 className="fw-bold mt-1 text-danger">
                    {restrictedPorts.length}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card border-0 rounded-4 p-2"
                style={{
                  backgroundColor: "#070d18",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4">
                  <div className="fs-2 mb-2">⚓</div>
                  <small style={{ color: "#8492a6" }}>Special Operations</small>
                  <h2 className="fw-bold mt-1 text-warning">
                    {specialPorts.length}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {compatiblePorts.length > 0 && (
            <div className="mb-5">
              <small
                className="text-uppercase fw-bold tracking-wider"
                style={{ color: "#38bdf8", fontSize: "0.75rem" }}
              >
                RECOMMENDED PORTS
              </small>

              <h3 className="fw-bold mt-1 mb-4 text-white">
                Compatible Destinations
              </h3>

              <div className="row g-4">
                {compatiblePorts.map((port) => (
                  <div className="col-md-6 col-lg-4" key={port.id}>
                    <div
                      className="card border-0 rounded-4 h-100 p-2"
                      style={{
                        backgroundColor: "#070d18",
                        border: "1px solid #162234",
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="fw-bold mb-1 text-white">
                              {port.name}
                            </h5>
                            <small style={{ color: "#8492a6" }}>
                              {port.state}
                            </small>
                          </div>

                          <span
                            className="badge rounded-pill px-3 py-1.5 fw-bold"
                            style={{
                              backgroundColor: "#dcfce7",
                              color: "#15803d",
                              border: "1px solid #86efac",
                              fontSize: "0.82rem",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                          >
                            ✓ Compatible
                          </span>
                        </div>

                        <hr style={{ borderColor: "#162234" }} />

                        <div className="row g-3">
                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>Draft</small>
                            <div className="fw-bold text-white">
                              {port.maxDraft ?? "N/A"} m
                            </div>
                          </div>

                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>LOA</small>
                            <div className="fw-bold text-white">
                              {port.maxLOA ?? "N/A"} m
                            </div>
                          </div>

                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>Beam</small>
                            <div className="fw-bold text-white">
                              {port.maxBeam ?? "N/A"} m
                            </div>
                          </div>

                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>Berths</small>
                            <div className="fw-bold text-white">
                              {port.berths ?? "N/A"}
                            </div>
                          </div>
                        </div>

                        {port.notes && (
                          <p
                            className="small mt-3 pt-3 mb-0"
                            style={{
                              color: "#8492a6",
                              borderTop: "1px solid #162234",
                            }}
                          >
                            {port.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {restrictedPorts.length > 0 && (
            <div>
              <small
                className="text-uppercase fw-bold tracking-wider"
                style={{ color: "#38bdf8", fontSize: "0.75rem" }}
              >
                OPERATIONAL LIMITATIONS
              </small>

              <h3 className="fw-bold mt-1 mb-4 text-white">
                Ports Requiring Attention
              </h3>

              <div className="row g-4">
                {restrictedPorts.map((port) => (
                  <div className="col-md-6" key={port.id}>
                    <div
                      className="card border-0 rounded-4 p-2"
                      style={{
                        backgroundColor: "#070d18",
                        border: "1px solid #162234",
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="fw-bold text-white">{port.name}</h5>
                            <small style={{ color: "#8492a6" }}>
                              {port.state}
                            </small>
                          </div>

                          <span
                            className="badge rounded-pill px-3 py-1.5 fw-bold"
                            style={{
                              backgroundColor: "#fee2e2",
                              color: "#b91c1c",
                              border: "1px solid #fca5a5",
                              fontSize: "0.82rem",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                          >
                            ⚠ Restricted
                          </span>
                        </div>

                        <div>
                          {port.restrictions.map((restriction, index) => (
                            <div
                              key={index}
                              className="d-flex align-items-center gap-2 mb-2"
                            >
                              <span>⚠️</span>
                              <span
                                className="small"
                                style={{ color: "#8492a6" }}
                              >
                                {restriction}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CHARTERING RECOMMENDATION */}
      <section id="recommendation"
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
      >
        <div className="container py-4">
          <div className="text-center mb-4">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              DECISION INTELLIGENCE
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Chartering Strategy Recommendation
            </h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div
                className="card border-0 rounded-4 p-2"
                style={{
                  backgroundColor: "#070d18",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex gap-4 align-items-start flex-column flex-md-row">
                    <div className="fs-1">📊</div>

                    <div className="flex-grow-1">
                      <h4 className="fw-bold text-white">
                        {compatiblePorts.length > 0
                          ? "Vessel-port compatibility is favorable."
                          : "Consider an alternative vessel class."}
                      </h4>

                      {loadingAnalysis && (
                        <div className="mt-3 d-flex align-items-center gap-3">
                          <Spinner size={22} />
                          <span style={{ color: "#8492a6" }}>
                            Generating recommendation…
                          </span>
                        </div>
                      )}

                      {analysisError && !loadingAnalysis && (
                        <div
                          className="mt-3 p-3 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                          style={{
                            backgroundColor: "#0b1320",
                            border: "1px solid #3f1d1d",
                          }}
                        >
                          <span style={{ color: "#f87171" }}>
                            AI recommendation unavailable — {analysisError}
                          </span>
                          <button
                            className="btn retry-action btn-sm fw-semibold px-3 rounded-3"
                            style={{ backgroundColor: "#1e88e5" }}
                            onClick={handleRetry}
                          >
                            ↻ Retry
                          </button>
                        </div>
                      )}

                      {analysis && !loadingAnalysis && !analysisError && (
                        <p className="mt-3" style={{ color: "#8492a6" }}>
                          {analysis.forecast?.charterAdvice || analysis.forecast?.charterRecommendation}
                        </p>
                      )}

                      <p style={{ color: "#8492a6" }}>
                        {compatiblePorts.length > 0
                          ? `The selected ${vesselType} can operate at ${compatiblePorts.length} of ${ports.length} analyzed locations.`
                          : `The selected ${vesselType} exceeds the draft/length limits of the primary ports.`}
                      </p>

                      <div className="recommendation-locations mt-4 pt-3">
                        <div className="small fw-semibold mb-2" style={{ color: "#285943" }}>
                          Analyzed locations
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {compatiblePorts.map((port) => (
                            <span className="location-chip compatible-chip" key={port.id}>✓ {port.name}</span>
                          ))}
                          {specialPorts.map((port) => (
                            <span className="location-chip special-chip" key={port.id}>⚓ {port.name}</span>
                          ))}
                          {restrictedPorts.map((port) => (
                            <span className="location-chip restricted-chip" key={port.id}>! {port.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-5 mt-auto">
        <div className="container">
          <div
            className="rounded-4 p-4 p-md-5 text-white shadow-lg"
            style={{
              backgroundColor: "#0b1320",
              border: "1px solid #1e2d42",
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 className="fw-bold text-white">Need another forecast?</h2>
                <p className="mb-0" style={{ color: "#8492a6" }}>
                  Adjust the route, vessel class, or cargo requirements and run another scenario.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                <button
                  className="btn new-forecast-action btn-lg px-4 rounded-3 fw-semibold"
                  style={{ backgroundColor: "#1e88e5" }}
                  onClick={() => navigate("/forecast_query")}
                >
                  New Forecast →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
};

export default ForecastResults;