import React, { useState, useEffect, useRef } from "react";
import { saveCooldownSession } from "../utils/db";

const STRETCHES = [
  {
    id: "cat_cow",
    name: "Cat-Cow Stretch 🐈🐫",
    desc: "Start on hands and knees. Alternately arch your back up toward the ceiling and dip your belly toward the floor.",
    duration: 30,
    tip: "Coordinate with breathing: inhale as belly drops, exhale as back arches up."
  },
  {
    id: "child_pose",
    name: "Child's Pose 🧘",
    desc: "Kneel on the floor, sit back on your heels, extend your arms forward on the ground, and rest your forehead down.",
    duration: 40,
    tip: "Focus on deep belly breathing and letting your chest sink closer to the floor."
  },
  {
    id: "downward_dog",
    name: "Downward Facing Dog 🐕",
    desc: "Press your hands and feet flat, lift your hips high and back, forming an inverted 'V' shape.",
    duration: 30,
    tip: "Pedal your feet out to stretch calves and maintain a strong shoulder push."
  },
  {
    id: "quad_stretch",
    name: "Standing Quad Stretch 🦵",
    desc: "Stand tall, bend one knee, and bring your foot toward your glute. Hold it with your hand, then switch.",
    duration: 40,
    tip: "Hold a wall for balance if needed. Keep your knees aligned close together."
  }
];

export default function Recovery() {
  const [activeRoutine, setActiveRoutine] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STRETCHES[0].duration);
  const [isPaused, setIsPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  
  const timerRef = useRef(null);
  const currentStretch = STRETCHES[currentIdx];

  // Helper for voice commands
  const speak = (msg) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(msg);
    u.rate = 1.1;
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    if (activeRoutine && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeRoutine) {
      handleStretchComplete();
    }

    return () => clearInterval(timerRef.current);
  }, [activeRoutine, isPaused, timeLeft]);

  const handleStartRoutine = () => {
    setActiveRoutine(true);
    setCurrentIdx(0);
    setTimeLeft(STRETCHES[0].duration);
    setIsPaused(false);
    setFinished(false);
    speak(`Starting recovery routine. First stretch is ${STRETCHES[0].name}. ${STRETCHES[0].desc}`);
  };

  const handleStretchComplete = () => {
    clearInterval(timerRef.current);
    
    const nextIdx = currentIdx + 1;
    if (nextIdx < STRETCHES.length) {
      setCurrentIdx(nextIdx);
      setTimeLeft(STRETCHES[nextIdx].duration);
      speak(`Great job. Next stretch is ${STRETCHES[nextIdx].name}. ${STRETCHES[nextIdx].desc}`);
    } else {
      // Completed all
      setActiveRoutine(false);
      setFinished(true);
      saveCooldownSession("Full Body Recovery", STRETCHES.length);
      speak("Congratulations! Recovery session completed successfully. Keep up the good work!");
    }
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    speak(isPaused ? "Resuming" : "Paused");
  };

  const handleSkip = () => {
    handleStretchComplete();
  };

  const handleCancel = () => {
    clearInterval(timerRef.current);
    setActiveRoutine(false);
    setFinished(false);
    speak("Stretch session cancelled.");
  };

  const progressPct = ((currentStretch.duration - timeLeft) / currentStretch.duration) * 100;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px" }}>
          🧘‍♂️ RANGE OF MOTION & HEALTH
        </p>
        <h1 style={{ fontSize: "2.25rem", marginTop: "4px" }}>
          Recovery & <span style={{ color: "var(--accent)" }}>Stretching</span> 🧘‍♂️
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "6px", fontSize: "14px" }}>
          Complete guided cooldown routines with active pacing timers to lengthen muscles, relieve tightness, and lower heart rate.
        </p>
      </div>

      {!activeRoutine && !finished && (
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem", textAlign: "center" }}>
          <span style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🧘‍♂️</span>
          <h2 style={{ marginBottom: "10px" }}>Full Body Recovery Routine</h2>
          <p style={{ color: "var(--muted)", maxWidth: "500px", fontSize: "14px", lineHeight: "1.6", marginBottom: "2rem" }}>
            A 2.5-minute full body recovery routine focusing on back extension, glute stretch, shoulder mobility, and hamstring length. Recommended post-workout.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", width: "100%", maxWidth: "600px", marginBottom: "2rem" }}>
            {STRETCHES.map((s, index) => (
              <div
                key={s.id}
                style={{
                  flex: "1 1 200px",
                  padding: "12px",
                  backgroundColor: "var(--sidebar)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  textAlign: "left"
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#FFFFFF" }}>
                  {index + 1}. {s.name.split(" ")[0]} {s.name.split(" ").slice(1).join(" ")}
                </div>
                <div style={{ fontSize: "11px", color: "var(--accent-light)", marginTop: "4px" }}>Duration: {s.duration}s</div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={handleStartRoutine}>
            ⚡ Start Recovery Session
          </button>
        </div>
      )}

      {activeRoutine && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "2.5rem" }}>
          {/* Top Progress bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)", marginBottom: "8px", fontWeight: 600 }}>
              <span>STRETCH {currentIdx + 1} OF {STRETCHES.length}</span>
              <span>{Math.round(progressPct)}% COMPLETE</span>
            </div>
            <div style={{ width: "100%", height: "8px", backgroundColor: "var(--sidebar)", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${progressPct}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, var(--accent), var(--accent-light))",
                  transition: "width 0.3s ease"
                }}
              />
            </div>
          </div>

          {/* Active stretch details */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <span style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧘</span>
            <h2 style={{ fontSize: "24px", color: "#FFFFFF", marginBottom: "10px" }}>
              {currentStretch.name}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "14px", maxWidth: "500px", lineHeight: "1.6", marginBottom: "1.25rem" }}>
              {currentStretch.desc}
            </p>
            <div style={{ fontStyle: "italic", fontSize: "12px", color: "var(--accent-light)", padding: "10px 16px", backgroundColor: "rgba(99,102,241,0.06)", borderRadius: "10px", borderLeft: "3.5px solid var(--accent)", maxWidth: "500px" }}>
              💡 <strong>Tip:</strong> {currentStretch.tip}
            </div>
          </div>

          {/* Timer Circle */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                border: `4px solid ${isPaused ? "var(--warning)" : "var(--accent)"}`,
                boxShadow: `0 0 20px rgba(${isPaused ? '245,158,11' : '99,102,241'}, 0.25)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--sidebar)"
              }}
            >
              <span style={{ fontSize: "42px", fontWeight: 700, color: "#FFFFFF", fontFamily: "'Outfit', sans-serif" }}>
                {timeLeft}s
              </span>
              <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>
                {isPaused ? "Paused" : "Remaining"}
              </span>
            </div>
          </div>

          {/* Control buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button className="btn btn-secondary" style={{ width: "120px" }} onClick={handleCancel}>
              ✖ Cancel
            </button>
            <button
              className={`btn ${isPaused ? "btn-primary" : "btn-secondary"}`}
              style={{ width: "140px", border: isPaused ? "none" : "1.5px solid var(--warning)", color: isPaused ? "#FFFFFF" : "var(--warning)" }}
              onClick={handlePauseToggle}
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button className="btn btn-primary" style={{ width: "120px" }} onClick={handleSkip}>
              Skip ▶▶
            </button>
          </div>
        </div>
      )}

      {finished && (
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 2rem", textAlign: "center" }}>
          <span style={{ fontSize: "4.5rem", marginBottom: "1.5rem" }}>🏆</span>
          <h2 style={{ color: "var(--success)", marginBottom: "8px" }}>Cooldown Completed!</h2>
          <p style={{ color: "var(--muted)", maxWidth: "450px", fontSize: "14px", lineHeight: "1.6", marginBottom: "2rem" }}>
            Amazing work! Taking time to stretch helps flush lactic acid, restore heart rate variability, and improves long-term athletic mobility.
          </p>

          <div style={{ padding: "12px 24px", borderRadius: "12px", backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", marginBottom: "2rem" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#FFFFFF" }}>
              ✓ Cooldown logged in your achievements progress database.
            </span>
          </div>

          <button className="btn btn-primary" onClick={handleStartRoutine}>
            ⚡ Run Again
          </button>
        </div>
      )}
    </div>
  );
}
