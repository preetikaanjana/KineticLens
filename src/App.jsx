import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import AITrainer from "./pages/AITrainer";
import Planner from "./pages/Planner";
import Calendar from "./pages/Calendar";
import CycleSync from "./pages/CycleSync";
import Recovery from "./pages/Recovery";
import BodyTracker from "./pages/BodyTracker";
import Achievements from "./pages/Achievements";
import Login from "./pages/Login";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("kineticlens_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("home");
  const [selectedExercise, setSelectedExercise] = useState("bicep_curl");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("kineticlens_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("kineticlens_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogin = (profile) => {
    setUser(profile);
    setActiveTab("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("kineticlens_user");
    setUser(null);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance("Logged out successfully");
      window.speechSynthesis.speak(u);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <Home
            setActiveTab={setActiveTab}
            setSelectedExercise={setSelectedExercise}
            theme={theme}
            user={user}
          />
        );
      case "trainer":
        return (
          <AITrainer
            selectedExercise={selectedExercise}
            setSelectedExercise={setSelectedExercise}
            theme={theme}
          />
        );
      case "planner":
        return <Planner />;
      case "calendar":
        return <Calendar />;
      case "cyclesync":
        return <CycleSync />;
      case "recovery":
        return <Recovery />;
      case "tracker":
        return <BodyTracker theme={theme} />;
      case "achievements":
        return <Achievements />;
      default:
        return (
          <Home
            setActiveTab={setActiveTab}
            setSelectedExercise={setSelectedExercise}
            theme={theme}
            user={user}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="main-content">{renderContent()}</main>
    </div>
  );
}
