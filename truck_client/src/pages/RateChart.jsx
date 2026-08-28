import { useEffect, useRef } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

function RateChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-secondary py-5">
        No trend data available.
      </div>
    );
  }

  const chartRef = useRef(null);

  // Extract labels and points
  const labels = data.map((point) => point.month || point.label);
  const historicalValues = data.map((point) => point.historicalRate ?? null);
  const projectedValues = data.map((point) => point.projectedRate ?? null);

  const allNumbers = [...historicalValues, ...projectedValues].filter(
    (v) => typeof v === "number" && Number.isFinite(v)
  );

  const minVal = allNumbers.length ? Math.min(...allNumbers) : 15;
  const maxVal = allNumbers.length ? Math.max(...allNumbers) : 25;
  const yMin = Math.floor((minVal - 1.0) * 2) / 2;
  const yMax = Math.ceil((maxVal + 1.0) * 2) / 2;

  const chartData = {
    labels,
    datasets: [
      {
        label: "Historical Rate",
        data: historicalValues,
        borderColor: "#10b981", // Emerald green
        borderWidth: 3.5,
        backgroundColor: "rgba(16, 185, 129, 0.14)", // Soft green area
        pointBackgroundColor: "#0f172a", // Dark center
        pointBorderColor: "#10b981",
        pointBorderWidth: 3,
        pointRadius: 5.5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#10b981",
        pointHoverBorderColor: "#ffffff",
        tension: 0.35,
        fill: true,
        spanGaps: false,
      },
      {
        label: "Projected Rate",
        data: projectedValues,
        borderColor: "#38bdf8", // Sky blue
        borderWidth: 3.5,
        borderDash: [6, 6], // Dashed projection line
        backgroundColor: "rgba(56, 189, 248, 0.12)", // Soft blue area
        pointBackgroundColor: "#0f172a", // Dark center
        pointBorderColor: "#38bdf8",
        pointBorderWidth: 3,
        pointRadius: 5.5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#38bdf8",
        pointHoverBorderColor: "#ffffff",
        tension: 0.35,
        fill: true,
        spanGaps: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          color: "#334155",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 24,
          font: {
            size: 13,
            weight: "600",
            family: "'Segoe UI', Roboto, sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            if (context.raw === null || context.raw === undefined) return null;
            return ` ${context.dataset.label}: $${Number(context.raw).toFixed(2)} / tonne`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#475569",
          padding: 10,
          font: {
            size: 12,
            weight: "500",
          },
        },
        border: {
          color: "#cbd5e1",
        },
      },
      y: {
        min: yMin,
        max: yMax,
        ticks: {
          color: "#64748b",
          stepSize: 0.5,
          padding: 10,
          callback: (value) => Number(value).toFixed(1),
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(226, 232, 240, 0.8)",
          drawBorder: false,
        },
        title: {
          display: true,
          text: "USD / tonne",
          color: "#64748b",
          font: {
            size: 12,
            weight: "600",
          },
          padding: { bottom: 10 },
        },
        border: {
          dash: [4, 4],
          color: "transparent",
        },
      },
    },
  };

  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  return (
    <div
      className="p-4 p-md-5 rounded-4 shadow-sm"
      style={{
        backgroundColor: "#fafaf9",
        border: "1px solid #e7e5e4",
        width: "100%",
      }}
    >
      <div className="mb-4">
        <h3
          className="fw-bold mb-0"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: "#1c1917",
            fontSize: "1.5rem",
          }}
        >
          Forecast Chart
        </h3>
      </div>
      <div style={{ width: "100%", height: 380 }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}

export default RateChart;
