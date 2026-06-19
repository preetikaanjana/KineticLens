import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { saveBodyEntry, getBodyEntries } from "../utils/db";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function BodyTracker({ theme }) {
  const [entries, setEntries] = useState([]);
  
  // Form input fields
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [goalWeightKg, setGoalWeightKg] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [hipsCm, setHipsCm] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [armsCm, setArmsCm] = useState("");
  const [thighsCm, setThighsCm] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);

  const refreshEntries = () => {
    const list = getBodyEntries();
    // Sort entries by date ascending for charts
    const sorted = [...list].sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
    setEntries(sorted);

    // Auto-populate last recorded height and goal weight
    if (list.length > 0) {
      const last = list[list.length - 1];
      setHeightCm(last.height_cm || "");
      setGoalWeightKg(last.goal_weight_kg || "");
    }
  };

  useEffect(() => {
    refreshEntries();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weightKg) return;

    saveBodyEntry({
      entry_date: entryDate,
      height_cm: Number(heightCm) || 0,
      weight_kg: Number(weightKg),
      goal_weight_kg: Number(goalWeightKg) || 0,
      waist_cm: Number(waistCm) || 0,
      hips_cm: Number(hipsCm) || 0,
      chest_cm: Number(chestCm) || 0,
      arms_cm: Number(armsCm) || 0,
      thighs_cm: Number(thighsCm) || 0
    });

    // Clear weight field and reset date
    setWeightKg("");
    setWaistCm("");
    setHipsCm("");
    setChestCm("");
    setArmsCm("");
    setThighsCm("");
    setEntryDate(new Date().toISOString().split("T")[0]);

    refreshEntries();
  };

  // Prepare chart data
  const chartLabels = entries.map(e => {
    const d = new Date(e.entry_date + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  });

  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ["No Data"],
    datasets: [
      {
        label: "Weight (kg)",
        data: entries.map(e => e.weight_kg),
        borderColor: "#06B6D4",
        backgroundColor: "rgba(6, 182, 212, 0.12)",
        tension: 0.2,
        borderWidth: 3,
        pointBackgroundColor: "#6366F1",
        pointBorderColor: "#FFFFFF",
        pointHoverRadius: 7,
        fill: true
      },
      {
        label: "Goal Weight (kg)",
        data: entries.map(e => e.goal_weight_kg),
        borderColor: "rgba(99, 102, 241, 0.4)",
        borderDash: [6, 6],
        borderWidth: 2,
        pointStyle: "line",
        fill: false
      }
    ]
  };

  const isLight = theme === "light";
  const gridColor = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.05)";
  const tickColor = isLight ? "#64748B" : "#9CA3AF";
  const legendColor = isLight ? "#1E293B" : "#FFFFFF";

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: legendColor, font: { family: "Outfit" } }
      },
      tooltip: { padding: 10 }
    },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: { color: tickColor }
      },
      x: {
        grid: { color: gridColor },
        ticks: { color: tickColor }
      }
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px" }}>
          📊 BODY COMPOSITION TRENDS
        </p>
        <h1 style={{ fontSize: "2.25rem", marginTop: "4px" }}>
          Body Progress <span style={{ color: "var(--accent)" }}>Tracker</span> 📊
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "6px", fontSize: "14px" }}>
          Record weight trends and optional body dimension circumferences to track aesthetic muscular changes over time.
        </p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "1.2fr 1.8fr" }}>
        {/* Entry Form */}
        <div className="card">
          <h3 style={{ fontSize: "18px", marginBottom: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            Log New Metrics
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ gap: "10px", marginBottom: "0px" }}>
              <div>
                <label>Date</label>
                <input
                  type="date"
                  className="input"
                  required
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                />
              </div>
              <div>
                <label>Weight (kg)*</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  required
                  placeholder="e.g. 74.2"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: "10px", marginBottom: "0px" }}>
              <div>
                <label>Height (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="input"
                  placeholder="e.g. 178"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
              </div>
              <div>
                <label>Goal Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  placeholder="e.g. 70.0"
                  value={goalWeightKg}
                  onChange={(e) => setGoalWeightKg(e.target.value)}
                />
              </div>
            </div>

            <h4 style={{ fontSize: "12px", color: "var(--accent-light)", marginTop: "8px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Circumferences (cm) - Optional
            </h4>

            <div className="grid-3" style={{ gap: "8px", marginBottom: "0px" }}>
              <div>
                <label>Waist</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  placeholder="Waist"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                />
              </div>
              <div>
                <label>Hips</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  placeholder="Hips"
                  value={hipsCm}
                  onChange={(e) => setHipsCm(e.target.value)}
                />
              </div>
              <div>
                <label>Chest</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  placeholder="Chest"
                  value={chestCm}
                  onChange={(e) => setChestCm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: "10px", marginBottom: "0px" }}>
              <div>
                <label>Arms</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  placeholder="Biceps"
                  value={armsCm}
                  onChange={(e) => setArmsCm(e.target.value)}
                />
              </div>
              <div>
                <label>Thighs</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  placeholder="Quads"
                  value={thighsCm}
                  onChange={(e) => setThighsCm(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              ⚡ Save Metric Entry
            </button>
          </form>
        </div>

        {/* Chart and History Logs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Weight Trend Chart */}
          <div className="card" style={{ height: "320px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Weight Progress Trend</h3>
            <div style={{ flex: 1, position: "relative" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* History table */}
          <div className="card" style={{ flex: 1, maxHeight: "250px", display: "flex", flexDirection: "column", marginBottom: 0 }}>
            <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Log History</h3>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {entries.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid var(--border)", textAlign: "left", color: "var(--muted)" }}>
                      <th style={{ padding: "8px 6px" }}>Date</th>
                      <th style={{ padding: "8px 6px" }}>Weight</th>
                      <th style={{ padding: "8px 6px" }}>Waist</th>
                      <th style={{ padding: "8px 6px" }}>Chest</th>
                      <th style={{ padding: "8px 6px" }}>Arms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...entries].reverse().map(e => (
                      <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "8px 6px" }}>{e.entry_date}</td>
                        <td style={{ padding: "8px 6px", color: "var(--accent-light)", fontWeight: "bold" }}>{e.weight_kg} kg</td>
                        <td style={{ padding: "8px 6px" }}>{e.waist_cm ? `${e.waist_cm} cm` : "—"}</td>
                        <td style={{ padding: "8px 6px" }}>{e.chest_cm ? `${e.chest_cm} cm` : "—"}</td>
                        <td style={{ padding: "8px 6px" }}>{e.arms_cm ? `${e.arms_cm} cm` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  No metrics recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
