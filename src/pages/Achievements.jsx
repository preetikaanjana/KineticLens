import React, { useState, useEffect } from "react";
import { getAchievements } from "../utils/db";

export default function Achievements() {
  const [badges, setBadges] = useState(getAchievements());

  useEffect(() => {
    setBadges(getAchievements());
  }, []);

  const totalUnlocked = badges.filter(b => b.unlocked).length;
  const unlockPct = Math.round((totalUnlocked / badges.length) * 100);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px" }}>
          🏆 MILESTONES & REWARDS
        </p>
        <h1 style={{ fontSize: "2.25rem", marginTop: "4px" }}>
          Athlete <span style={{ color: "var(--accent)" }}>Achievements</span> 🏆
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "6px", fontSize: "14px" }}>
          Complete AI workouts, maintain consistency streaks, schedule exercises, and log recoveries to unlock performance medals.
        </p>
      </div>

      {/* Progress overview header */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: "2rem", padding: "1.75rem 2rem", background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.08) 100%)" }}>
        <div style={{ fontSize: "3rem" }}>🏆</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "18px" }}>Cabinet Completion</h3>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--accent-light)" }}>
              {totalUnlocked} of {badges.length} Badges ({unlockPct}%)
            </span>
          </div>
          <div style={{ width: "100%", height: "10px", backgroundColor: "var(--sidebar)", borderRadius: "5px", overflow: "hidden" }}>
            <div
              style={{
                width: `${unlockPct}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--accent), var(--accent-light))",
                transition: "width 0.5s ease-out"
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid cabinet */}
      <div className="grid-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", marginTop: "1.5rem" }}>
        {badges.map((badge) => {
          const progressPct = Math.round((badge.progress / badge.target) * 100);
          
          return (
            <div
              key={badge.key}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: badge.unlocked ? 1 : 0.65,
                borderWidth: "1.5px",
                borderColor: badge.unlocked ? "rgba(99, 102, 241, 0.4)" : "var(--border)",
                boxShadow: badge.unlocked ? "0 10px 30px rgba(99, 102, 241, 0.15)" : "var(--shadow)",
                background: badge.unlocked 
                  ? "linear-gradient(185deg, var(--card) 60%, rgba(99,102,241,0.06) 100%)" 
                  : "var(--card)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <h4 style={{ fontSize: "16px", color: badge.unlocked ? "#FFFFFF" : "var(--muted)" }}>
                    {badge.title}
                  </h4>
                  {badge.unlocked ? (
                    <span className="badge" style={{ backgroundColor: "rgba(16, 185, 129, 0.12)", color: "var(--success)", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: "10px" }}>
                      Unlocked
                    </span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", color: "var(--muted)", border: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "10px" }}>
                      Locked
                    </span>
                  )}
                </div>

                <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.4", minHeight: "36px" }}>
                  {badge.description}
                </p>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>
                  <span>Progress</span>
                  <span style={{ fontWeight: "bold", color: badge.unlocked ? "var(--accent-light)" : "var(--muted)" }}>
                    {badge.progress} / {badge.target} ({progressPct}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: "6px", backgroundColor: "var(--sidebar)", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(progressPct, 100)}%`,
                      height: "100%",
                      backgroundColor: badge.unlocked ? "var(--accent)" : "rgba(255, 255, 255, 0.12)",
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
