import React, { useState, useEffect } from "react";
import { getCalendarDays, upsertCalendarDay } from "../utils/db";

const MOODS = [
  { emoji: "🔋", label: "Full Energy" },
  { emoji: "📈", label: "Good" },
  { emoji: "🧘", label: "Balanced" },
  { emoji: "📉", label: "Tired" },
  { emoji: "🪫", label: "Low Battery" }
];

const STATUSES = [
  { id: "empty", label: "No Activity" },
  { id: "planned", label: "Planned Workout 📋" },
  { id: "completed", label: "Completed Workout ✅" },
  { id: "rest", label: "Rest Day 🧘" }
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split("T")[0]);
  
  // Selected day details form state
  const [status, setStatus] = useState("empty");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [mood, setMood] = useState("");

  const refreshCalendar = () => {
    const list = getCalendarDays();
    const map = {};
    list.forEach(day => {
      map[day.day_date] = day;
    });
    setCalendarData(map);
  };

  useEffect(() => {
    refreshCalendar();
  }, []);

  // Update form inputs when selected date changes
  useEffect(() => {
    const existing = calendarData[selectedDateStr];
    if (existing) {
      setStatus(existing.status || "empty");
      setTitle(existing.title || "");
      setDetails(existing.details || "");
      setMood(existing.mood || "");
    } else {
      setStatus("empty");
      setTitle("");
      setDetails("");
      setMood("");
    }
  }, [selectedDateStr, calendarData]);

  const year = currentDate.getFullYear();
  const monthIdx = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Days in month calculation
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstDayIndex = new Date(year, monthIdx, 1).getDay();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, monthIdx - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, monthIdx + 1, 1));
  };

  // Submit day data
  const handleSaveDay = (e) => {
    e.preventDefault();
    upsertCalendarDay(selectedDateStr, status, title, details, mood);
    refreshCalendar();
  };

  // Build calendar dates list
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null); // padding for preceding days
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(new Date(year, monthIdx, d));
  }

  const getCellStyles = (date) => {
    if (!date) return { visibility: "hidden" };
    
    const dateStr = date.toISOString().split("T")[0];
    const isSelected = selectedDateStr === dateStr;
    const isToday = new Date().toISOString().split("T")[0] === dateStr;
    const dayVal = calendarData[dateStr];

    let border = "1px solid rgba(255, 255, 255, 0.05)";
    let background = "transparent";
    let color = "#FFFFFF";

    if (isSelected) {
      border = "1.5px solid var(--accent)";
      background = "rgba(99, 102, 241, 0.15)";
    } else if (isToday) {
      border = "1.5px solid var(--accent-light)";
      background = "rgba(6, 182, 212, 0.08)";
    }

    if (dayVal) {
      if (dayVal.status === "completed") {
        background = "rgba(16, 185, 129, 0.15)";
        border = "1px solid var(--success)";
      } else if (dayVal.status === "planned") {
        background = "rgba(245, 158, 11, 0.12)";
        border = "1px solid var(--warning)";
      } else if (dayVal.status === "rest") {
        background = "rgba(255, 255, 255, 0.04)";
        color = "var(--muted)";
      }
    }

    return {
      border,
      background,
      color,
      cursor: "pointer",
      aspectRatio: "1/1",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "8px",
      position: "relative",
      transition: "all 0.15s ease"
    };
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--accent-light)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px" }}>
          🗓️ INTERACTIVE SCHEDULE
        </p>
        <h1 style={{ fontSize: "2.25rem", marginTop: "4px" }}>
          Workout <span style={{ color: "var(--accent)" }}>Calendar</span> 🗓️
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "6px", fontSize: "14px" }}>
          Track past workout achievements, plan future exercises, and monitor your energy mood trends.
        </p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
        {/* Calendar Grid card */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "18px" }}>
              {monthNames[monthIdx]} {year}
            </h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={handlePrevMonth}>
                ◀ Prev
              </button>
              <button className="btn btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={handleNextMonth}>
                Next ▶
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center", marginBottom: "8px" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <span key={day} style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "bold", textTransform: "uppercase" }}>
                {day}
              </span>
            ))}
          </div>

          {/* Calendar days cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
            {calendarCells.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} style={{ visibility: "hidden", aspectRatio: "1/1" }} />;
              
              const dateStr = date.toISOString().split("T")[0];
              const cellDay = calendarData[dateStr];
              
              return (
                <div
                  key={dateStr}
                  style={getCellStyles(date)}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className="calendar-cell"
                >
                  <span style={{ fontSize: "13px", fontWeight: "bold" }}>{date.getDate()}</span>
                  
                  {/* Status indicators */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    {cellDay?.mood && (
                      <span style={{ fontSize: "12px" }} title={cellDay.mood}>
                        {MOODS.find(m => m.label === cellDay.mood)?.emoji || "📝"}
                      </span>
                    )}
                    {cellDay?.status === "completed" && (
                      <span style={{ color: "var(--success)", fontSize: "10px", fontWeight: "bold" }}>✓</span>
                    )}
                    {cellDay?.status === "planned" && (
                      <span style={{ color: "var(--warning)", fontSize: "10px", fontWeight: "bold" }}>●</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend indicator */}
          <div style={{ display: "flex", gap: "16px", marginTop: "1.5rem", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--muted)" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.4)", border: "1px solid var(--success)" }} />
              Completed Workout
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--muted)" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "rgba(245, 158, 11, 0.3)", border: "1px solid var(--warning)" }} />
              Planned Workout
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--muted)" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.04)" }} />
              Rest Day
            </div>
          </div>
        </div>

        {/* Selected date log editor card */}
        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            Log details for: <br />
            <span style={{ color: "var(--accent-light)", fontSize: "14px" }}>
              {new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </h3>

          <form onSubmit={handleSaveDay}>
            <div>
              <label>Status</label>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {status !== "empty" && (
              <>
                <div>
                  <label>Workout Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Chest workout, Rest & Walk"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label>Notes / Routine details</label>
                  <textarea
                    className="textarea"
                    placeholder="Describe exercises, reps, or wellness outcomes..."
                    rows="3"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label>Energy Mood Status</label>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "4px", marginTop: "6px", marginBottom: "12px" }}>
                {MOODS.map(m => {
                  const isActive = mood === m.label;
                  return (
                    <button
                      type="button"
                      key={m.label}
                      title={m.label}
                      onClick={() => setMood(m.label)}
                      style={{
                        flex: 1,
                        fontSize: "20px",
                        padding: "6px",
                        borderRadius: "10px",
                        background: isActive ? "rgba(99, 102, 241, 0.2)" : "var(--sidebar)",
                        border: isActive ? "1.5px solid var(--accent)" : "1.5px solid #283556",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {m.emoji}
                    </button>
                  );
                })}
              </div>
              {mood && (
                <div style={{ fontSize: "11px", color: "var(--accent-light)", textAlign: "center", marginBottom: "12px", fontWeight: 600 }}>
                  Selected: {mood}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "6px" }}>
              ⚡ Save Day Logs
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
