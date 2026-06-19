import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import { getDashboardStats } from "../utils/db";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EXERCISES_LIST = [
  { id: "bicep_curl", name: "Bicep Curl", muscle: "Arms", diff: "Medium", path: "trainer" },
  { id: "squat", name: "Squats", muscle: "Legs", diff: "Medium", path: "trainer" },
  { id: "pushups", name: "Push-ups", muscle: "Chest", diff: "Medium", path: "trainer" },
  { id: "dumbbell_fly", name: "Dumbbell Fly", muscle: "Chest", diff: "Easy", path: "trainer" },
  { id: "tricep_kickback", name: "Tricep Kickback", muscle: "Arms", diff: "Easy", path: "trainer" },
  { id: "lunge", name: "Lunges", muscle: "Legs", diff: "Medium", path: "trainer" },
  { id: "shoulder_press", name: "Shoulder Press", muscle: "Shoulders", diff: "Medium", path: "trainer" },
  { id: "jumping_jacks", name: "Jumping Jacks", muscle: "Cardio", diff: "Easy", path: "trainer" },
  { id: "high_knees", name: "High Knees", muscle: "Cardio", diff: "Hard", path: "trainer" },
  { id: "burpees", name: "Burpees", muscle: "Cardio", diff: "Hard", path: "trainer" }
];

export default function Home({ setActiveTab, setSelectedExercise, theme, user }) {
  const [stats, setStats] = useState(getDashboardStats());

  useEffect(() => {
    // Refresh stats when component loads
    setStats(getDashboardStats());
  }, []);

  const handleStartWorkout = (id) => {
    setSelectedExercise(id);
    setActiveTab("trainer");
  };

  const isLight = theme === "light";
  const gridColor = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.05)";
  const tickColor = isLight ? "#64748B" : "#9CA3AF";

  // Plotly-equivalent Line chart settings in Chart.js
  const lineChartData = {
    labels: stats.score_dates.length > 0 ? stats.score_dates : ["No Data"],
    datasets: [
      {
        label: "Posture Score (%)",
        data: stats.scores.length > 0 ? stats.scores : [0],
        borderColor: "#6366F1",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: "#06B6D4",
        pointBorderColor: "#FFFFFF",
        pointHoverRadius: 7,
        fill: true
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { padding: 10 }
    },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: { color: tickColor },
        min: 0,
        max: 100
      },
      x: {
        grid: { color: gridColor },
        ticks: { color: tickColor }
      }
    }
  };

  // Bar Chart Data (Workouts per Week)
  const barChartData = {
    labels: ["Week 3", "Week 2", "Week 1", "This Week"],
    datasets: [
      {
        label: "Workouts Completed",
        data: stats.weekly_counts,
        backgroundColor: "rgba(99, 102, 241, 0.75)",
        borderColor: "#6366F1",
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: { color: tickColor, stepSize: 1 }
      },
      x: {
        grid: { color: gridColor },
        ticks: { color: tickColor }
      }
    }
  };

  const quotes = [
    "⚡ The only bad workout is the one that didn't happen. Push your limits!",
    "💎 Fall in love with taking care of your body. It's the only place you have to live.",
    "🔥 Small daily progress adds up to massive long-term results. Keep going!"
  ];
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px" }}>
          ⚡ {todayStr.toUpperCase()}
        </p>
        <h1 style={{ fontSize: "2.25rem", marginTop: "4px" }}>
          Welcome back, <span style={{ color: "var(--accent)" }}>{user?.name || "Athlete"}</span> ⚡
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "6px", fontSize: "14px" }}>
          Ready to crush your workout today? Consistency is the key to progress!
        </p>
      </div>

      {/* Motivational Quote */}
      <div className="card" style={{ borderLeft: "4px solid var(--accent)", padding: "14px 20px", background: "linear-gradient(90deg, rgba(99,102,241,0.06), transparent)" }}>
        <p style={{ fontStyle: "italic", fontSize: "14px", color: "var(--text)" }}>"{quote}"</p>
      </div>

      {/* Stats Section */}
      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total Workouts ⚡", val: stats.total_workouts },
          { label: "Current Streak 🔥", val: `${stats.streak_days} Days` },
          { label: "Avg Posture Score 💎", val: `${stats.avg_posture}%` },
          { label: "Top Exercise 🏆", val: stats.top_exercise }
        ].map((item, idx) => (
          <div key={idx} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--accent-light)" }}>{item.val}</div>
            <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "4px", fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ height: "360px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>Posture Accuracy Trend (Last 10 sessions)</h3>
          <div style={{ flex: 1, position: "relative" }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="card" style={{ height: "360px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>Workout Sessions per Week</h3>
          <div style={{ flex: 1, position: "relative" }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Quick Start Grid */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", borderBottom: "2px solid rgba(99,102,241,0.2)", paddingBottom: "8px", marginBottom: "1rem" }}>
          Quick Start Exercises 🏃‍♂️
        </h2>
        <div className="grid-3">
          {EXERCISES_LIST.map((ex) => (
            <div 
              key={ex.id} 
              className="card" 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between"
              }}
            >
              <div>
                <h4 style={{ fontSize: "16px", color: "var(--text)" }}>⚡ {ex.name}</h4>
                <div style={{ display: "flex", gap: "6px", margin: "6px 0 10px", alignItems: "center" }}>
                  <span className="badge-muscle">{ex.muscle}</span>
                  <span className={`badge badge-${ex.diff.toLowerCase()}`}>{ex.diff}</span>
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ 
                  width: "100%", 
                  marginTop: "1.25rem",
                  color: "#FFFFFF"
                }}
                onClick={() => handleStartWorkout(ex.id)}
              >
                ⚡ Train Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
