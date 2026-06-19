import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("non_binary");
  const [level, setLevel] = useState("intermediate");
  const [goal, setGoal] = useState("build_muscle");
  const [errorMsg, setErrorMsg] = useState("");

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter username, 2 = enter new password
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const accountsStr = localStorage.getItem("kineticlens_accounts") || "{}";
      const accounts = JSON.parse(accountsStr);

      if (isLoginMode) {
        // --- Sign In Validation ---
        const userKey = username.trim().toLowerCase();
        const existingUser = accounts[userKey];

        if (!existingUser) {
          setErrorMsg("Account not found. Please register a new account first!");
          return;
        }

        if (existingUser.password !== password) {
          setErrorMsg("Incorrect password. Please try again.");
          return;
        }

        // Login success
        localStorage.setItem("kineticlens_user", JSON.stringify(existingUser));
        playVoiceWelcome(existingUser.name);
        onLogin(existingUser);
      } else {
        // --- Sign Up Registration ---
        if (!username.trim() || !password || !name.trim()) {
          setErrorMsg("All fields are required.");
          return;
        }

        const userKey = username.trim().toLowerCase();
        if (accounts[userKey]) {
          setErrorMsg("Username is already taken. Try logging in!");
          return;
        }

        const newProfile = {
          username: userKey,
          password: password,
          name: name.trim(),
          gender,
          level,
          goal,
          joined_at: new Date().toISOString()
        };

        accounts[userKey] = newProfile;
        localStorage.setItem("kineticlens_accounts", JSON.stringify(accounts));
        localStorage.setItem("kineticlens_user", JSON.stringify(newProfile));

        playVoiceWelcome(newProfile.name);
        onLogin(newProfile);
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setForgotSuccess("");

    try {
      const accountsStr = localStorage.getItem("kineticlens_accounts") || "{}";
      const accounts = JSON.parse(accountsStr);
      const userKey = forgotUsername.trim().toLowerCase();

      if (forgotStep === 1) {
        if (!accounts[userKey]) {
          setErrorMsg("Username not found.");
          return;
        }
        setForgotStep(2);
      } else {
        if (!forgotNewPassword) {
          setErrorMsg("Please enter a new password.");
          return;
        }
        accounts[userKey].password = forgotNewPassword;
        localStorage.setItem("kineticlens_accounts", JSON.stringify(accounts));
        setForgotSuccess("Password reset successfully! Redirecting...");
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotUsername("");
          setForgotNewPassword("");
          setForgotStep(1);
          setForgotSuccess("");
          setErrorMsg("");
        }, 1500);
      }
    } catch (err) {
      setErrorMsg("Failed to reset password.");
    }
  };

  const playVoiceWelcome = (userName) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Welcome back, ${userName}!`);
      u.rate = 1.1;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes float3D {
          0% { transform: perspective(1000px) rotateY(12deg) rotateX(8deg) translateY(0px); }
          50% { transform: perspective(1000px) rotateY(15deg) rotateX(6deg) translateY(-8px); }
          100% { transform: perspective(1000px) rotateY(12deg) rotateX(8deg) translateY(0px); }
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.06); opacity: 0.9; }
          100% { transform: scale(1); opacity: 0.7; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 800px) {
          .left-panel { display: none !important; }
          .right-panel { width: 100% !important; flex: 1 !important; }
        }
      `}</style>

      {/* Left Visual Panel - 3D Mockup Frame with Google/Unsplash Image */}
      <div className="left-panel" style={styles.leftPanel}>
        <div style={styles.glowBlob1} />
        <div style={styles.glowBlob2} />
        <div style={styles.visualContent}>
          <div style={styles.mockup3DFrame}>
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800"
              alt="Pose Estimation Workout"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Glassmorphic Pose Feedback Overlay */}
            <div style={styles.glassOverlay}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "9px", background: "rgba(45, 212, 191, 0.2)", color: "#2DD4BF", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                  ⚡ AI MODEL ACTIVE
                </span>
                <span style={{ fontSize: "10px", fontWeight: "bold", color: "#818CF8" }}>PLANK FORM</span>
              </div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#FFFFFF", letterSpacing: "0.5px" }}>
                SKELETAL ALIGNMENT: <span style={{ color: "#2DD4BF" }}>98%</span>
              </div>
            </div>
          </div>

          <h1 style={styles.visualTitle}>KINETICLENS</h1>
          <p style={styles.visualSubtitle}>
            Track your reps, analyze joint extensions, and correct your posture in real-time. Private local-only computer vision trainer.
          </p>
        </div>
      </div>

      {/* Right Login/Register Form Panel */}
      <div className="right-panel" style={styles.rightPanel}>
        <div className="card" style={styles.card}>
          {/* Brand/Mobile Title */}
          <div style={{ marginBottom: "1.25rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "0.5px", margin: 0 }}>
              <span style={{ color: "var(--accent)" }}>{isLoginMode ? "Welcome Back" : "Register Account"}</span>
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "4px" }}>
              {isLoginMode ? "Log in to resume your training streak" : "Create a local account to start tracking"}
            </p>
          </div>

          {/* Auth Toggle Tabs */}
          <div
            style={{
              display: "flex",
              background: "var(--bg)",
              padding: "4px",
              borderRadius: "10px",
              marginBottom: "1rem",
              border: "1px solid var(--border)"
            }}
          >
            <button
              type="button"
              style={{
                ...styles.toggleBtn,
                backgroundColor: isLoginMode ? "var(--card)" : "transparent",
                color: isLoginMode ? "var(--text)" : "var(--muted)",
                boxShadow: isLoginMode ? "var(--shadow)" : "none"
              }}
              onClick={() => {
                setIsLoginMode(true);
                setErrorMsg("");
              }}
            >
              🔑 Sign In
            </button>
            <button
              type="button"
              style={{
                ...styles.toggleBtn,
                backgroundColor: !isLoginMode ? "var(--card)" : "transparent",
                color: !isLoginMode ? "var(--text)" : "var(--muted)",
                boxShadow: !isLoginMode ? "var(--shadow)" : "none"
              }}
              onClick={() => {
                setIsLoginMode(false);
                setErrorMsg("");
              }}
            >
              ⚡ Register
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && !showForgotModal && (
            <div
              style={{
                fontSize: "11px",
                color: "var(--danger)",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid var(--danger)",
                padding: "8px 12px",
                borderRadius: "10px",
                marginBottom: "1rem",
                textAlign: "left",
                fontWeight: "bold"
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ textAlign: "left", overflowY: isLoginMode ? "visible" : "auto", paddingRight: isLoginMode ? 0 : "4px", flex: 1 }}>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Username</label>
              <input
                type="text"
                className="input"
                required
                placeholder={isLoginMode ? "Enter username" : "Choose username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.inputField}
              />
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input"
                  required
                  placeholder={isLoginMode ? "Enter password" : "Choose password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...styles.inputField, paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={styles.showPassBtn}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Forgot Password Link (Sign-in Mode only) */}
            {isLoginMode && (
              <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                <span
                  onClick={() => {
                    setShowForgotModal(true);
                    setErrorMsg("");
                    setForgotSuccess("");
                    setForgotStep(1);
                  }}
                  style={styles.forgotPassLink}
                >
                  Forgot Password?
                </span>
              </div>
            )}

            {!isLoginMode && (
              <>
                <div style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Display Name</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.inputField}
                  />
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Gender Identity</label>
                  <select
                    className="select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={styles.inputField}
                  >
                    <option value="non_binary">Non-Binary / Neutral 🧬</option>
                    <option value="male">Male ♂️</option>
                    <option value="female">Female ♀️</option>
                  </select>
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Experience Level</label>
                  <select
                    className="select"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    style={styles.inputField}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fitness Goal</label>
                  <select
                    className="select"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    style={styles.inputField}
                  >
                    <option value="build_muscle">Build Muscle 💪</option>
                    <option value="lose_weight">Fat Loss 🔥</option>
                    <option value="endurance">Endurance ⚡</option>
                    <option value="flexibility">Recovery 🧘</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "0.5rem",
                fontSize: "13px",
                borderRadius: "10px"
              }}
            >
              {isLoginMode ? "🚀 Log In" : "🌟 Complete Registration"}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={styles.modalOverlay}>
          <div className="card" style={styles.modalCard}>
            <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "var(--text)" }}>🔓 Reset Password</h3>
            <p style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "1rem" }}>
              {forgotStep === 1 
                ? "Enter your username to locate your account profile." 
                : "Enter your new desired password."}
            </p>

            {errorMsg && (
              <div style={{ fontSize: "11px", color: "var(--danger)", marginBottom: "10px", fontWeight: "bold" }}>
                ⚠️ {errorMsg}
              </div>
            )}
            {forgotSuccess && (
              <div style={{ fontSize: "11px", color: "var(--success)", marginBottom: "10px", fontWeight: "bold" }}>
                ✓ {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              {forgotStep === 1 ? (
                <div style={{ marginBottom: "12px", textAlign: "left" }}>
                  <label style={{ fontSize: "10px", textTransform: "uppercase" }}>Username</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="Enter your username"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    style={styles.inputField}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: "12px", textAlign: "left" }}>
                  <label style={{ fontSize: "10px", textTransform: "uppercase" }}>New Password</label>
                  <input
                    type="password"
                    className="input"
                    required
                    placeholder="Enter new password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    style={styles.inputField}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForgotModal(false);
                    setErrorMsg("");
                    setForgotSuccess("");
                  }}
                  style={{ flex: 1, padding: "8px", fontSize: "12px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: "8px", fontSize: "12px" }}
                >
                  {forgotStep === 1 ? "Next ➡️" : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    maxHeight: "100vh",
    overflow: "hidden",
    backgroundColor: "var(--bg)",
    fontFamily: "'Inter', sans-serif"
  },
  leftPanel: {
    flex: "1.2",
    backgroundImage: 'linear-gradient(135deg, rgba(9, 13, 22, 0.82), rgba(21, 28, 44, 0.88)), url("https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    position: "relative",
    overflow: "hidden",
    borderRight: "1.5px solid rgba(99, 102, 241, 0.15)"
  },
  glowBlob1: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
    top: "5%",
    left: "5%",
    animation: "pulseGlow 7s infinite ease-in-out"
  },
  glowBlob2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, transparent 70%)",
    bottom: "5%",
    right: "5%",
    animation: "pulseGlow 9s infinite ease-in-out 1.5s"
  },
  visualContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    maxWidth: "460px",
    animation: "slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  mockup3DFrame: {
    width: "380px",
    height: "250px",
    borderRadius: "20px",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 25px 55px rgba(0, 0, 0, 0.65)",
    transform: "perspective(1000px) rotateY(12deg) rotateX(8deg)",
    animation: "float3D 6s infinite ease-in-out",
    border: "1.5px solid rgba(255, 255, 255, 0.1)",
    margin: "0 auto 2.5rem"
  },
  glassOverlay: {
    position: "absolute",
    bottom: "16px",
    left: "16px",
    right: "16px",
    background: "rgba(10, 15, 25, 0.8)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "10px 14px",
    borderRadius: "14px",
    color: "#FFFFFF",
    textAlign: "left"
  },
  visualTitle: {
    fontSize: "2.5rem",
    fontWeight: "900",
    letterSpacing: "3px",
    background: "linear-gradient(135deg, #FFFFFF, #94A3B8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "1rem"
  },
  visualSubtitle: {
    fontSize: "13.5px",
    color: "#94A3B8",
    lineHeight: "1.6",
    textAlign: "center",
    margin: "0 auto"
  },
  rightPanel: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "var(--bg)",
    overflowY: "hidden"
  },
  card: {
    width: "100%",
    maxWidth: "365px",
    maxHeight: "92vh",
    padding: "1.75rem 1.5rem",
    background: "var(--card)",
    border: "1.5px solid var(--border)",
    boxShadow: "var(--shadow)",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  toggleBtn: {
    flex: 1,
    border: "none",
    padding: "8px 0",
    fontSize: "12.5px",
    fontWeight: "bold",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  inputField: {
    padding: "8px 12px",
    fontSize: "13px",
    marginTop: "3px",
    marginBottom: "4px"
  },
  showPassBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
    padding: "4px",
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  forgotPassLink: {
    fontSize: "11px",
    color: "var(--accent)",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    transition: "color 0.2s ease"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modalCard: {
    width: "100%",
    maxWidth: "340px",
    padding: "1.5rem",
    background: "var(--card)",
    border: "1.5px solid var(--border)",
    borderRadius: "20px",
    boxShadow: "var(--shadow)",
    textAlign: "center"
  }
};
