import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("non_binary");
  const [level, setLevel] = useState("intermediate");
  const [goal, setGoal] = useState("build_muscle");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profile = {
      name: name.trim(),
      gender,
      level,
      goal,
      joined_at: new Date().toISOString()
    };

    localStorage.setItem("lemonade_user", JSON.stringify(profile));
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Welcome, ${profile.name}!`);
      u.rate = 1.1;
      window.speechSynthesis.speak(u);
    }

    onLogin(profile);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        fontFamily: "'Inter', sans-serif",
        padding: "1rem"
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "360px",
          padding: "1.5rem",
          background: "linear-gradient(135deg, var(--sidebar) 0%, rgba(22, 31, 48, 0.95) 100%)",
          border: "1.5px solid rgba(99, 102, 241, 0.25)",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.4)",
          textAlign: "center",
          marginBottom: 0
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <span style={{ fontSize: "2.5rem" }}>🍋</span>
          <h1 style={{ fontSize: "1.75rem", marginTop: "4px", letterSpacing: "0.5px" }}>
            <span style={{ color: "#6366F1" }}>LEMON</span>
            <span style={{ color: "#06B6D4" }}>ADE</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "2px" }}>
            AI Fitness Posture Trainer
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "11px", marginBottom: "2px" }}>Name</label>
            <input
              type="text"
              className="input"
              required
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: "8px 12px", fontSize: "13px", marginTop: "2px", marginBottom: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "11px", marginBottom: "2px" }}>Gender Identity</label>
            <select
              className="select"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ padding: "8px 12px", fontSize: "13px", marginTop: "2px", marginBottom: "4px" }}
            >
              <option value="non_binary">Non-Binary / Neutral 🧬</option>
              <option value="male">Male ♂️</option>
              <option value="female">Female ♀️</option>
            </select>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "11px", marginBottom: "2px" }}>Experience Level</label>
            <select
              className="select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{ padding: "8px 12px", fontSize: "13px", marginTop: "2px", marginBottom: "4px" }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "11px", marginBottom: "2px" }}>Training Goal</label>
            <select
              className="select"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={{ padding: "8px 12px", fontSize: "13px", marginTop: "2px", marginBottom: "4px" }}
            >
              <option value="build_muscle">Build Muscle 💪</option>
              <option value="lose_weight">Fat Loss 🔥</option>
              <option value="endurance">Endurance ⚡</option>
              <option value="flexibility">Recovery 🧘</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "10px", marginTop: "1rem", fontSize: "14px", borderRadius: "10px" }}
          >
            🚀 Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
