/**
 * LocalStorage database adapter for KineticLens AI Fitness App.
 * Persists sessions, calendar entries, body metrics, and achievements.
 */

const getActiveUsername = () => {
  try {
    const userStr = localStorage.getItem("kineticlens_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.username || "guest";
    }
  } catch (e) {}
  return "guest";
};

// Helper to get items, prefixed by active user
const get = (key, defaultVal) => {
  try {
    const username = getActiveUsername();
    const prefixedKey = `${username}_${key}`;
    const data = localStorage.getItem(prefixedKey);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

// Helper to set items, prefixed by active user
const set = (key, val) => {
  try {
    const username = getActiveUsername();
    const prefixedKey = `${username}_${key}`;
    localStorage.setItem(prefixedKey, JSON.stringify(val));
  } catch (e) {}
};

// Save a completed workout session
export const saveSession = (exercise, repsCorrect, repsIncorrect, postureScore = null, durationSec = 0, errorBreakdown = {}) => {
  const sessions = get("workout_sessions", []);
  
  let finalScore = postureScore;
  const total = repsCorrect + repsIncorrect;
  if (finalScore === null && total > 0) {
    finalScore = Math.round((repsCorrect / total) * 100);
  } else if (finalScore === null) {
    finalScore = 0;
  }

  const newSession = {
    id: Date.now(),
    exercise,
    reps_correct: Number(repsCorrect),
    reps_incorrect: Number(repsIncorrect),
    posture_score: Number(finalScore),
    duration_sec: Number(durationSec),
    error_breakdown: errorBreakdown,
    created_at: new Date().toISOString()
  };

  sessions.unshift(newSession); // add to beginning
  set("workout_sessions", sessions);

  // Auto-log to Calendar as completed
  const todayStr = new Date().toISOString().split('T')[0];
  upsertCalendarDay(todayStr, "completed", `${exercise.replace('_', ' ').toUpperCase()} Workout`, `Completed ${repsCorrect} correct reps with a score of ${finalScore}%!`);

  return newSession;
};

// Get all sessions
export const getAllSessions = () => {
  return get("workout_sessions", []);
};

// Compute Streak
const computeStreak = (datesSet) => {
  if (datesSet.size === 0) return 0;
  const sorted = Array.from(datesSet).sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  let current = new Date();
  
  // Check if active today or yesterday to continue streak
  const todayStr = current.toISOString().split('T')[0];
  current.setDate(current.getDate() - 1);
  const yesterdayStr = current.toISOString().split('T')[0];
  
  if (!datesSet.has(todayStr) && !datesSet.has(yesterdayStr)) {
    return 0;
  }

  let checkDate = datesSet.has(todayStr) ? new Date() : current;
  while (true) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (datesSet.has(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

// Compute Best Streak
const computeBestStreak = (datesSet) => {
  if (datesSet.size === 0) return 0;
  const sorted = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));
  
  let best = 0;
  let current = 0;
  let prevDate = null;

  for (const dStr of sorted) {
    const d = new Date(dStr);
    if (prevDate === null) {
      current = 1;
    } else {
      const diffTime = Math.abs(d - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        current++;
      } else if (diffDays > 1) {
        current = 1;
      }
    }
    best = Math.max(best, current);
    prevDate = d;
  }
  return best;
};

// Get weekly workouts counts (last 4 weeks)
const getWeeklyCounts = (sessions) => {
  const counts = [0, 0, 0, 0];
  const today = new Date();
  
  sessions.forEach(s => {
    const sDate = new Date(s.created_at);
    const diffTime = Math.abs(today - sDate);
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    if (diffWeeks >= 0 && diffWeeks < 4) {
      counts[3 - diffWeeks]++;
    }
  });
  return counts;
};

// Get Dashboard Statistics
export const getDashboardStats = () => {
  const sessions = getAllSessions();
  if (sessions.length === 0) {
    return {
      total_workouts: 0,
      avg_reps: 0,
      avg_posture: 0,
      top_exercise: "—",
      best_streak: 0,
      streak_days: 0,
      days_active: 0,
      scores: [],
      score_dates: [],
      weekly_counts: [0, 0, 0, 0],
      exercise_counts: {},
      recent: []
    };
  }

  const total = sessions.length;
  const avg_reps = Math.round(sessions.reduce((sum, s) => sum + s.reps_correct, 0) / total);
  
  const scoreSessions = sessions.filter(s => s.posture_score !== null);
  const avg_posture = scoreSessions.length > 0 
    ? Math.round(scoreSessions.reduce((sum, s) => sum + s.posture_score, 0) / scoreSessions.length)
    : 0;

  // Exercise Breakdown
  const exCounts = {};
  sessions.forEach(s => {
    exCounts[s.exercise] = (exCounts[s.exercise] || 0) + 1;
  });
  const top_exercise = Object.keys(exCounts).reduce((a, b) => exCounts[a] > exCounts[b] ? a : b, "—");

  // Streak & Active Days
  const datesSet = new Set(sessions.map(s => s.created_at.split('T')[0]));
  const streak_days = computeStreak(datesSet);
  const best_streak = computeBestStreak(datesSet);
  const days_active = datesSet.size;

  // Scores progress (last 10 sessions, reversed to chronological order)
  const recentSessions = [...sessions].slice(0, 10).reverse();
  const scores = recentSessions.map(s => s.posture_score);
  const score_dates = recentSessions.map(s => {
    const d = new Date(s.created_at);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  });

  return {
    total_workouts: total,
    avg_reps,
    avg_posture,
    top_exercise: top_exercise.replace('_', ' ').toUpperCase(),
    best_streak,
    streak_days,
    days_active,
    scores,
    score_dates,
    weekly_counts: getWeeklyCounts(sessions),
    exercise_counts: exCounts,
    recent: sessions.slice(0, 5) // recent 5
  };
};

// Calendar CRUD operations
export const upsertCalendarDay = (dayDate, status, title = "", details = "", mood = "") => {
  const calendar = get("calendar_days", {});
  calendar[dayDate] = {
    day_date: dayDate,
    status,
    title,
    details,
    mood: mood || (calendar[dayDate] ? calendar[dayDate].mood : "")
  };
  set("calendar_days", calendar);
  return calendar[dayDate];
};

export const getCalendarDays = () => {
  const calendar = get("calendar_days", {});
  return Object.values(calendar);
};

// Body metric entries
export const saveBodyEntry = (data) => {
  const entries = get("body_entries", []);
  const newEntry = {
    id: Date.now(),
    entry_date: data.entry_date || new Date().toISOString().split('T')[0],
    height_cm: Number(data.height_cm),
    weight_kg: Number(data.weight_kg),
    goal_weight_kg: Number(data.goal_weight_kg),
    waist_cm: Number(data.waist_cm),
    hips_cm: Number(data.hips_cm),
    chest_cm: Number(data.chest_cm),
    arms_cm: Number(data.arms_cm),
    thighs_cm: Number(data.thighs_cm),
    created_at: new Date().toISOString()
  };
  entries.push(newEntry);
  set("body_entries", entries);
  return newEntry;
};

export const getBodyEntries = () => {
  return get("body_entries", []);
};

// Cooldown sessions
export const saveCooldownSession = (routineType, stretchesDone) => {
  const sessions = get("cooldown_sessions", []);
  const newSession = {
    id: Date.now(),
    routine_type: routineType,
    stretches_done: Number(stretchesDone),
    created_at: new Date().toISOString()
  };
  sessions.push(newSession);
  set("cooldown_sessions", sessions);
  return newSession;
};

export const getCooldownCount = () => {
  const sessions = get("cooldown_sessions", []);
  return sessions.length;
};

// achievements builder
export const getAchievements = () => {
  const sessions = getAllSessions();
  const cooldownCount = getCooldownCount();
  const calendar = getCalendarDays();
  const total = sessions.length;

  const datesSet = new Set(sessions.map(s => s.created_at.split('T')[0]));
  const streak = computeStreak(datesSet);
  const hasPerfectPosture = sessions.some(s => s.posture_score === 100);
  const hasSpeedSession = sessions.some(s => s.duration_sec > 0 && s.duration_sec < 180 && s.reps_correct > 0);
  
  // Consecutive improvements in posture score (last 3)
  const reversedScores = [...sessions].reverse().map(s => s.posture_score);
  let improve3 = false;
  if (reversedScores.length >= 3) {
    const len = reversedScores.length;
    if (reversedScores[len-1] > reversedScores[len-2] && reversedScores[len-2] > reversedScores[len-3]) {
      improve3 = true;
    }
  }

  // Weeks with scheduled items
  const scheduledWeeks = new Set();
  calendar.forEach(c => {
    if (c.status === "planned" || c.status === "completed") {
      const d = new Date(c.day_date);
      const year = d.getFullYear();
      const oneJan = new Date(year, 0, 1);
      const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
      const weekNumber = Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
      scheduledWeeks.add(`${year}-w${weekNumber}`);
    }
  });

  const milestones = [
    {
      key: "first_rep",
      title: "🥇 First Rep",
      description: "Complete your first AI-tracked workout session.",
      unlocked: total >= 1,
      progress: Math.min(total, 1),
      target: 1
    },
    {
      key: "week_warrior",
      title: "🔥 Week Warrior",
      description: "Maintain a 7-day workout streak.",
      unlocked: streak >= 7,
      progress: Math.min(streak, 7),
      target: 7
    },
    {
      key: "perfect_form",
      title: "💯 Perfect Form",
      description: "Achieve a flawless 100% score on your posture.",
      unlocked: hasPerfectPosture,
      progress: hasPerfectPosture ? 1 : 0,
      target: 1
    },
    {
      key: "centurion",
      title: "🏋️‍♂️ Centurion",
      description: "Complete 50 total workout sessions.",
      unlocked: total >= 50,
      progress: Math.min(total, 50),
      target: 50
    },
    {
      key: "planner_pro",
      title: "📅 Planner Pro",
      description: "Schedule sessions across 4 separate weeks.",
      unlocked: scheduledWeeks.size >= 4,
      progress: Math.min(scheduledWeeks.size, 4),
      target: 4
    },
    {
      key: "recovery_king",
      title: "🧘‍♂️ Recovery Master",
      description: "Complete 10 mobility and stretching routines.",
      unlocked: cooldownCount >= 10,
      progress: Math.min(cooldownCount, 10),
      target: 10
    },
    {
      key: "speed_demon",
      title: "⚡ Speed Demon",
      description: "Complete an AI-tracked session in under 3 minutes.",
      unlocked: hasSpeedSession,
      progress: hasSpeedSession ? 1 : 0,
      target: 1
    },
    {
      key: "level_up",
      title: "📈 Steady Gains",
      description: "Improve your posture score 3 sessions in a row.",
      unlocked: improve3,
      progress: improve3 ? 3 : Math.min(reversedScores.length, 2),
      target: 3
    }
  ];

  return milestones;
};
