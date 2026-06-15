import React, { useState } from "react";
import { upsertCalendarDay } from "../utils/db";

const GOALS = [
  { id: "build_muscle", label: "Build Muscle 💪", desc: "Hypertrophy & strength training focused" },
  { id: "lose_weight", label: "Fat Loss & Tone 🔥", desc: "Calorie burn & lean muscle building" },
  { id: "endurance", label: "Stamina & Conditioning ⚡", desc: "High intensity, cardiovascular health" },
  { id: "flexibility", label: "Mobility & Recovery 🧘", desc: "Stretch routines & joint health" }
];

const LEVELS = [
  { id: "beginner", label: "Beginner", desc: "New to training or returning" },
  { id: "intermediate", label: "Intermediate", desc: "Consistently training for 6+ months" },
  { id: "advanced", label: "Advanced", desc: "Experienced, looking for a challenge" }
];

const EXERCISES_MAP = {
  build_muscle: [
    { day: 1, title: "Chest & Arms Focus", detail: "Dumbbell Fly, Pushups, Bicep Curls (3 sets x 12 reps)", type: "chest_arms" },
    { day: 2, title: "Legs & Core Strength", detail: "Squats, Lunges, Calf Raises (4 sets x 15 reps)", type: "legs" },
    { day: 3, title: "Rest & Active Recovery", detail: "Mobility stretches or light walk", type: "rest" },
    { day: 4, title: "Arm Blaster Peak", detail: "Bicep Curls, Tricep Kickbacks, Push-ups (3 sets x 15 reps)", type: "arms" },
    { day: 5, title: "Chest Demolition", detail: "Dumbbell Fly, Pushups, Plank holds (4 sets x 12 reps)", type: "chest" },
    { day: 6, title: "Legs Hypertrophy", detail: "Squats, Glute Bridges, Quad holds (4 sets x 20 reps)", type: "legs" },
    { day: 7, title: "Rest & Recovery", detail: "Complete stretch routine", type: "rest" }
  ],
  lose_weight: [
    { day: 1, title: "Full Body HIIT", detail: "Squats, Pushups, Bicep Curls (Active time 30s, Rest 15s)", type: "full_body" },
    { day: 2, title: "Core & Stamina", detail: "Planks, Tricep Kickbacks, Mountain Climbers (3 sets)", type: "core" },
    { day: 3, title: "Rest / Light Walking", detail: "Active rest day - 10k steps goal", type: "rest" },
    { day: 4, title: "Lower Body Burn", detail: "Squats, Lunges, Glute Bridges (4 sets)", type: "legs" },
    { day: 5, title: "Upper Body Sculpt", detail: "Push-ups, Dumbbell Flys, Bicep Curls (3 sets)", type: "upper_body" },
    { day: 6, title: "Cardio Conditioning", detail: "Jacks, Kickbacks, Squats fast-paced (25 mins)", type: "cardio" },
    { day: 7, title: "Rest & Stretch", detail: "Full body recovery cooldown", type: "rest" }
  ],
  endurance: [
    { day: 1, title: "Cardio Kickoff", detail: "High-rep Squats, jumping jacks, mountain climbers", type: "cardio" },
    { day: 2, title: "Muscular Endurance", detail: "Bicep Curls, Tricep Kickbacks, Push-ups (25 reps each)", type: "arms" },
    { day: 3, title: "Rest & Mobilize", detail: "Easy stretching & recovery exercises", type: "rest" },
    { day: 4, title: "Upper Body Endurance", detail: "Pushups, Dumbbell Flyes, Planks (max duration)", type: "upper_body" },
    { day: 5, title: "Leg Burn Circuit", detail: "Bodyweight Squats, lunges, calf holds (high volume)", type: "legs" },
    { day: 6, title: "Aerobic Capacity", detail: "Tempo squats, light shadow boxing, recovery poses", type: "cardio" },
    { day: 7, title: "Rest & Hydrate", detail: "Deep breathing & full body recovery", type: "rest" }
  ],
  flexibility: [
    { day: 1, title: "Upper Body Opening", detail: "Chest openers, shoulder rolls, wrist stretches", type: "stretch" },
    { day: 2, title: "Lower Body Lengthening", detail: "Hamstring stretch, quad holds, calf extension", type: "stretch" },
    { day: 3, title: "Rest & Meditate", detail: "Mindful rest, breathing focus", type: "rest" },
    { day: 4, title: "Spine & Core Mobility", detail: "Cat-Cow, Child's Pose, cobra stretch", type: "stretch" },
    { day: 5, title: "Full Body Release", detail: "Downward dog, hip flexor stretch, deep squat hold", type: "stretch" },
    { day: 6, title: "Balance & Stability", detail: "Tree pose, single-leg stands, joint mobility", type: "balance" },
    { day: 7, title: "Rest & Restore", detail: "Gentle restorative stretches", type: "rest" }
  ]
};

export default function Planner() {
  const [goal, setGoal] = useState("build_muscle");
  const [level, setLevel] = useState("intermediate");
  const [frequency, setFrequency] = useState(4);
  const [focusArea, setFocusArea] = useState("full_body");
  const [equipment, setEquipment] = useState("dumbbells");
  
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate weekly schedule based on choices
    const baseRoutine = EXERCISES_MAP[goal];
    
    // Adjust schedule based on weekly frequency
    // E.g. If frequency is 3, we keep 3 workout days and mark others as rest days
    let workoutDaysCount = 0;
    const finalPlan = baseRoutine.map((item, idx) => {
      // Always rest on days 3 and 7 to avoid overtraining
      if (item.type === "rest") {
        return { ...item };
      }
      
      if (workoutDaysCount < frequency) {
        workoutDaysCount++;
        // Customize titles/details based on level and equipment
        let titleSuffix = "";
        let detailsPrefix = "";
        if (level === "beginner") {
          titleSuffix = " (Intro)";
          detailsPrefix = "Focus on form. ";
        } else if (level === "advanced") {
          titleSuffix = " (Max Power)";
          detailsPrefix = "Increase tempo and volume. ";
        }

        let eqDetails = "";
        if (equipment === "bodyweight") {
          eqDetails = " (Use Bodyweight only - no weights needed)";
        } else if (equipment === "dumbbells") {
          eqDetails = " (Utilize Dumbbells)";
        } else {
          eqDetails = " (Standard Gym Equipment)";
        }

        return {
          ...item,
          title: item.title + titleSuffix,
          detail: detailsPrefix + item.detail + eqDetails,
          isWorkout: true
        };
      } else {
        return {
          day: item.day,
          title: "Rest Day",
          detail: "Active rest day - recover, hydrate, and prepare for your next training session.",
          type: "rest",
          isWorkout: false
        };
      }
    });

    setGeneratedPlan(finalPlan);
    setScheduleSuccess(false);
  };

  const handleAddToCalendar = () => {
    if (!generatedPlan) return;

    const today = new Date();
    // Schedule for the next 7 days starting tomorrow
    generatedPlan.forEach((item, index) => {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + index);
      const dateStr = targetDate.toISOString().split("T")[0];

      const status = item.type === "rest" ? "rest" : "planned";
      upsertCalendarDay(dateStr, status, item.title, item.detail);
    });

    setScheduleSuccess(true);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px" }}>
          📋 TAILORED WORKOUT PLANS
        </p>
        <h1 style={{ fontSize: "2.25rem", marginTop: "4px" }}>
          AI Workout <span style={{ color: "var(--accent)" }}>Planner</span> 📋
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "6px", fontSize: "14px" }}>
          Answer a few questions to generate a customized 7-day schedule and load it directly onto your interactive calendar.
        </p>
      </div>

      <div className="grid-2">
        {/* Form Container */}
        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            Fitness Quiz
          </h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Select Fitness Goal</label>
              <select className="select" value={goal} onChange={(e) => setGoal(e.target.value)}>
                {GOALS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Experience Level</label>
              <select className="select" value={level} onChange={(e) => setLevel(e.target.value)}>
                {LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Weekly Frequency ({frequency} Days/Week)</label>
              <input
                type="range"
                min="2"
                max="5"
                className="input"
                style={{ height: "6px", cursor: "pointer", background: "var(--sidebar)", accentColor: "var(--accent)" }}
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Focus Area</label>
              <select className="select" value={focusArea} onChange={(e) => setFocusArea(e.target.value)}>
                <option value="full_body">Full Body conditioning</option>
                <option value="upper_body">Upper Body (Chest & Arms)</option>
                <option value="lower_body">Lower Body (Legs & Glutes)</option>
                <option value="core">Core & Stability</option>
              </select>
            </div>

            <div>
              <label>Equipment Available</label>
              <select className="select" value={equipment} onChange={(e) => setEquipment(e.target.value)}>
                <option value="bodyweight">No Equipment (Bodyweight only)</option>
                <option value="dumbbells">Dumbbells Only</option>
                <option value="gym">Full Gym Access</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              ⚡ Generate Custom Schedule
            </button>
          </form>
        </div>

        {/* Results Container */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {generatedPlan ? (
            <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <h3 style={{ fontSize: "18px" }}>Generated Weekly Plan</h3>
                <span className="badge badge-easy" style={{ fontSize: "10px" }}>{level}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                {generatedPlan.map((dayPlan) => (
                  <div
                    key={dayPlan.day}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "12px",
                      backgroundColor: dayPlan.type === "rest" ? "rgba(255, 255, 255, 0.03)" : "rgba(99, 102, 241, 0.07)",
                      border: dayPlan.type === "rest" ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(99,102,241,0.15)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: dayPlan.type === "rest" ? "var(--muted)" : "var(--accent-light)" }}>
                        DAY {dayPlan.day}
                      </span>
                      {dayPlan.type === "rest" && (
                        <span className="badge" style={{ backgroundColor: "rgba(255, 255, 255, 0.08)", color: "var(--muted)", fontSize: "9px" }}>
                          Rest
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: "#FFFFFF" }}>{dayPlan.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", lineHeight: "1.4" }}>{dayPlan.detail}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                {!scheduleSuccess ? (
                  <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleAddToCalendar}>
                    🗓️ Load Plan into Calendar
                  </button>
                ) : (
                  <div className="banner banner-success" style={{ margin: 0, justifyContent: "center", fontSize: "13px" }}>
                    ✓ Weekly schedule loaded to your Calendar!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "3rem" }}>
              <span style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</span>
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>No Plan Generated</h3>
              <p style={{ color: "var(--muted)", fontSize: "13px", maxWidth: "300px" }}>
                Fill in the fitness quiz and click "Generate Custom Schedule" to view your personal fitness program.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
