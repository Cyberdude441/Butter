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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

function RateChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-secondary py-5">
        No trend data available.
      </div>
    );
  }

  const chartRef = useRef(null);
  const values = data.flatMap((point) => [point.historicalRate, point.projectedRate]
    .filter((value) => typeof value === "number" && Number.isFinite(value)));
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = Math.max((maximum - minimum) * 0.35, 1);
  const domain = [Math.max(0, Math.floor(minimum - padding)), Math.ceil(maximum + padding)];

  const labels = data.map((point) => point.month);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Historical Rate",
        data: data.map((point) => point.historicalRate),
        borderColor: "#82a997",
        backgroundColor: "rgba(130, 169, 151, .18)",
        pointBackgroundColor: "#fffdf8",
        pointBorderColor: "#82a997",
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: .35,
        fill: true,
        spanGaps: false,
      },
      {
        label: "Projected Rate",
        data: data.map((point) => point.projectedRate),
        borderColor: "#d88978",
        backgroundColor: "rgba(216, 137, 120, .12)",
        pointBackgroundColor: "#fffdf8",
        pointBorderColor: "#d88978",
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: .35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    animation: { duration: 900, easing: "easeOutQuart" },
    plugins: {
      legend: { position: "bottom", labels: { color: "#344a3f", usePointStyle: true, padding: 20 } },
      tooltip: { callbacks: { label: (context) => ` ${context.dataset.label}: $${context.raw ?? "-"}/tonne` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#51635a", padding: 8 }, border: { color: "#cbd5ca" } },
      y: { min: domain[0], max: domain[1], ticks: { color: "#51635a" }, grid: { color: "#dfe5dc" }, title: { display: true, text: "USD / tonne", color: "#718076" } },
    },
  };

  useEffect(() => () => chartRef.current?.destroy(), []);

  return <div className="rate-chart" style={{ width: "100%", height: 390 }}><Line ref={chartRef} data={chartData} options={options} /></div>;
}

export default RateChart;