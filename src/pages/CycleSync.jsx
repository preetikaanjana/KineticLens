import React, { useState } from "react";

const CIRCADIAN_HOURS = [
  { hour: 0, title: "00:00 - Deep Rest & Cell Repair 💤", metabolic: "Peak Growth Hormone release & cell regeneration", tip: "Avoid light exposure and food intake to allow maximum cellular recovery.", color: "#4F46E5" },
  { hour: 4, title: "04:00 - Core Temp Minimum 📉", metabolic: "Lowest body temperature, metabolic activity slow", tip: "Deep sleep phase. Best for biological cell restoration.", color: "#3730A3" },
  { hour: 8, title: "08:00 - Cortisol Rise & Activation ☀️", metabolic: "Rapid cortisol rise, blood pressure increases, melatonin stops", tip: "Ideal for hydrating, viewing morning sunlight, and doing light mobility exercises.", color: "#D97706" },
  { hour: 11, title: "11:00 - Mental Sharpness Peak 🧠", metabolic: "High alertness, fast reaction time, stable blood glucose", tip: "Best window for complex problem solving or moderate steady-state cardio.", color: "#10B981" },
  { hour: 15, title: "15:00 - Physical Coordination Peak ⚡", metabolic: "Maximum cardiovascular efficiency & muscle strength", tip: "Optimal time for peak strength workouts, heavy squats, or speed work.", color: "#EF4444" },
  { hour: 18, title: "18:00 - Core Temp & Muscle Efficiency 📈", metabolic: "Highest body temperature, maximum joint flexibility", tip: "Excellent window for intense training or full-body flexibility routines.", color: "#F59E0B" },
  { hour: 21, title: "21:00 - Melatonin Secretion Kickoff 🌙", metabolic: "Melatonin secretion begins, bowel movements suppressed", tip: "Wind down physical workouts. Dim blue lights and focus on deep breathing.", color: "#4F46E5" }
];

const INFRADIAN_PHASES = [
  {
    phase: "Phase 1: Hormone Reset & Recovery 🧘‍♂️",
    days: "Days 1 - 7",
    intensity: "Low (Active Recovery)",
    focus: "Steady-state cardio, mobility stretches, light recovery walks.",
    nutrition: "Anti-inflammatory whole foods, warm broths, healthy fats, and iron-dense greens.",
    description: "During this low-hormone baseline, energy is reserved. Focus on restoring joint mobility and rebuilding foundations without overtaxing central nervous system.",
    color: "#06B6D4"
  },
  {
    phase: "Phase 2: Estrogen & Energy Peak ⚡",
    days: "Days 8 - 14",
    intensity: "Maximum (Strength & HIIT)",
    focus: "High-intensity intervals, heavy strength lifting, testing PRs.",
    nutrition: "Light proteins, fermented vegetables, fresh fruits, and high-quality complex carbohydrates.",
    description: "Estrogen levels are rising to a peak, elevating muscle recovery rates and metabolic efficiency. This is the optimal window to push limits and build lean mass.",
    color: "#10B981"
  },
  {
    phase: "Phase 3: Progesterone & Endurance Peak 🏋️‍♂️",
    days: "Days 15 - 21",
    intensity: "Moderate (Aerobic Endurance)",
    focus: "Steady-state moderate cardio, higher rep resistance training.",
    nutrition: "Fiber-rich complex grains, slow-release carbohydrates, root vegetables, and magnesium-dense seeds.",
    description: "Progesterone dominates, shifting metabolism to burning fat stores for fuel. Muscle endurance is high, but glycogen storage is lower. Keep workouts steady and avoid exhaustion.",
    color: "#F59E0B"
  },
  {
    phase: "Phase 4: Pre-Reset Wind Down 🛑",
    days: "Days 22 - 28",
    intensity: "Low-Moderate (Deload & Flexibility)",
    focus: "Yoga, deload weights, core stability, deep tissue rollouts.",
    nutrition: "Magnesium-rich foods (dark chocolate, seeds), calming herbal teas, and root starch.",
    description: "Hormone levels begin to drop. Exercise should focus on range-of-motion recovery and metabolic support to prevent fatigue and injury.",
    color: "#EF4444"
  }
];

export default function CycleSync() {
  const [circadianHour, setCircadianHour] = useState(15);
  const [infradianDay, setInfradianDay] = useState(10);

  // Find corresponding circadian hour index
  const getCircadianData = (hour) => {
    // Return the closest matching config hour
    return CIRCADIAN_HOURS.reduce((prev, curr) => {
      return (Math.abs(curr.hour - hour) < Math.abs(prev.hour - hour)) ? curr : prev;
    });
  };

  // Find corresponding infradian phase based on day 1-28
  const getInfradianData = (day) => {
    if (day <= 7) return INFRADIAN_PHASES[0];
    if (day <= 14) return INFRADIAN_PHASES[1];
    if (day <= 21) return INFRADIAN_PHASES[2];
    return INFRADIAN_PHASES[3];
  };

  const currentCircadian = getCircadianData(circadianHour);
  const currentInfradian = getInfradianData(infradianDay);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px" }}>
          🔄 BIOLOGICAL METABOLIC SYNC
        </p>
        <h1 style={{ fontSize: "2.25rem", marginTop: "4px" }}>
          Cycle <span style={{ color: "var(--accent)" }}>Syncing</span> Planner 🔄
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "6px", fontSize: "14px" }}>
          Sync your training frequency, intensity, and nutrition with your body's circadian (24-hour) and infradian (28-day) biological rhythms.
        </p>
      </div>

      <div className="grid-2">
        {/* Circadian Clock Slider */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "18px", marginBottom: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
              24h Circadian Sync ☀️🌙
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "1.5rem" }}>
              Drag the slider to your current hour to align workouts with natural cortisol and body temperature peaks.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "bold" }}>Hour of Day:</span>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: currentCircadian.color }}>
                  {String(circadianHour).padStart(2, '0')}:00 {circadianHour >= 12 ? 'PM' : 'AM'}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="23"
                value={circadianHour}
                onChange={(e) => setCircadianHour(Number(e.target.value))}
                style={{
                  height: "8px",
                  borderRadius: "4px",
                  outline: "none",
                  accentColor: currentCircadian.color,
                  background: "var(--sidebar)",
                  cursor: "pointer",
                  margin: "10px 0"
                }}
              />
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "16px",
                borderRadius: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: `1.5px solid ${currentCircadian.color}22`
              }}
            >
              <h4 style={{ fontSize: "15px", color: "#FFFFFF", marginBottom: "6px" }}>
                {currentCircadian.title}
              </h4>
              <div style={{ fontSize: "12px", color: "var(--accent-light)", fontWeight: 600, marginBottom: "8px" }}>
                Metabolic Status: <span style={{ color: "var(--text)" }}>{currentCircadian.metabolic}</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.4" }}>
                💡 <strong>Athletic Tip:</strong> {currentCircadian.tip}
              </p>
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "1rem" }}>
            * Circadian advice is formulated based on standard human hormonal secretion patterns.
          </div>
        </div>

        {/* Infradian Phase Slider */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "18px", marginBottom: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
              28-Day Infradian Sync 🔄
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "1.5rem" }}>
              Slide to the current day of your metabolic cycle (1-28) to optimize training intensity and nutritional recovery.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "bold" }}>Cycle Day:</span>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: currentInfradian.color }}>
                  Day {infradianDay} of 28
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="28"
                value={infradianDay}
                onChange={(e) => setInfradianDay(Number(e.target.value))}
                style={{
                  height: "8px",
                  borderRadius: "4px",
                  outline: "none",
                  accentColor: currentInfradian.color,
                  background: "var(--sidebar)",
                  cursor: "pointer",
                  margin: "10px 0"
                }}
              />
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "16px",
                borderRadius: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: `1.5px solid ${currentInfradian.color}22`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <h4 style={{ fontSize: "15px", color: "#FFFFFF" }}>
                  {currentInfradian.phase}
                </h4>
                <span className="badge" style={{ backgroundColor: `${currentInfradian.color}18`, color: currentInfradian.color, border: `1px solid ${currentInfradian.color}33` }}>
                  {currentInfradian.days}
                </span>
              </div>
              
              <div style={{ fontSize: "12px", color: "var(--accent-light)", fontWeight: 600, marginBottom: "8px" }}>
                Optimal Intensity: <span style={{ color: "var(--text)" }}>{currentInfradian.intensity}</span>
              </div>

              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.4", marginBottom: "8px" }}>
                🎯 <strong>Exercise Focus:</strong> {currentInfradian.focus}
              </p>
              
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.4", marginBottom: "8px" }}>
                🥗 <strong>Nutrition Strategy:</strong> {currentInfradian.nutrition}
              </p>

              <p style={{ fontSize: "12px", color: "var(--muted)", fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px", marginTop: "8px" }}>
                {currentInfradian.description}
              </p>
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "1rem" }}>
            * Syncing metabolic rhythms supports natural energy fluctuation and prevents overtraining injuries.
          </div>
        </div>
      </div>
    </div>
  );
}
