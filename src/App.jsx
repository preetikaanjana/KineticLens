import React, { useState } from "react";
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
      const saved = localStorage.getItem("lemonade_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("home");
  const [selectedExercise, setSelectedExercise] = useState("bicep_curl");

  const handleLogin = (profile) => {
    setUser(profile);
    setActiveTab("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("lemonade_user");
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
          />
        );
      case "trainer":
        return (
          <AITrainer
            selectedExercise={selectedExercise}
            setSelectedExercise={setSelectedExercise}
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
        return <BodyTracker />;
      case "achievements":
        return <Achievements />;
      default:
        return (
          <Home
            setActiveTab={setActiveTab}
            setSelectedExercise={setSelectedExercise}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
      <main className="main-content">{renderContent()}</main>
    </div>
  );
}
