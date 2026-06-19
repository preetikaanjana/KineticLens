import React, { useState, useRef, useEffect } from "react";

export default function Login({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // Added Email state
  const [gender, setGender] = useState("non_binary");
  const [level, setLevel] = useState("intermediate");
  const [goal, setGoal] = useState("build_muscle");
  const [errorMsg, setErrorMsg] = useState("");

  // Forgot password & OTP state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1 = username/email request, 2 = OTP check, 3 = new password override
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [showOtpToast, setShowOtpToast] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Refs for the 6 OTP input boxes
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Automatically hide mock email toast after 15 seconds
  useEffect(() => {
    let timer;
    if (showOtpToast) {
      timer = setTimeout(() => {
        setShowOtpToast(false);
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [showOtpToast]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const accountsStr = localStorage.getItem("kineticlens_accounts") || "{}";
      const accounts = JSON.parse(accountsStr);

      if (isLoginMode) {
        // --- Sign In Validation ---
        const loginInput = username.trim().toLowerCase();
        let existingUser = accounts[loginInput];

        // If not found by username, search by email
        if (!existingUser) {
          const foundKey = Object.keys(accounts).find(
            (key) => accounts[key].email === loginInput
          );
          if (foundKey) {
            existingUser = accounts[foundKey];
          }
        }

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
        if (!username.trim() || !password || !name.trim() || !email.trim()) {
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
          email: email.trim().toLowerCase(),
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

  const handleForgotPasswordRequest = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setForgotSuccess("");

    try {
      const accountsStr = localStorage.getItem("kineticlens_accounts") || "{}";
      const accounts = JSON.parse(accountsStr);
      const userKey = forgotUsername.trim().toLowerCase();
      const existingUser = accounts[userKey];

      if (!existingUser) {
        setErrorMsg("Username not found.");
        return;
      }

      if (existingUser.email !== forgotEmail.trim().toLowerCase()) {
        setErrorMsg("The email address does not match the registered user.");
        return;
      }

      // Username and email matched! Trigger sending simulated OTP
      setIsSendingOtp(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);

      setTimeout(() => {
        setIsSendingOtp(false);
        setForgotStep(2);
        setShowOtpToast(true);
        // Clear previous input values
        setOtpValues(["", "", "", "", "", ""]);
      }, 1800);

    } catch (err) {
      setErrorMsg("Could not verify details. Please try again.");
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMsg("");
    const enteredCode = otpValues.join("");

    if (enteredCode.length !== 6) {
      setErrorMsg("Please enter the full 6-digit OTP code.");
      return;
    }

    if (enteredCode !== generatedOtp) {
      setErrorMsg("Incorrect OTP code. Please check the notification and try again.");
      return;
    }

    // Success
    setForgotSuccess("OTP verified successfully!");
    setTimeout(() => {
      setForgotSuccess("");
      setForgotStep(3);
    }, 1000);
  };

  const handleResetPasswordOverride = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!forgotNewPassword || !forgotConfirmPassword) {
      setErrorMsg("Please fill out all password fields.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      const accountsStr = localStorage.getItem("kineticlens_accounts") || "{}";
      const accounts = JSON.parse(accountsStr);
      const userKey = forgotUsername.trim().toLowerCase();

      accounts[userKey].password = forgotNewPassword;
      localStorage.setItem("kineticlens_accounts", JSON.stringify(accounts));

      setForgotSuccess("Password updated successfully! Redirecting...");
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotUsername("");
        setForgotEmail("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotStep(1);
        setForgotSuccess("");
        setShowOtpToast(false);
      }, 1500);
    } catch (err) {
      setErrorMsg("Error overriding password. Please retry.");
    }
  };

  // Helper function to auto-tab between OTP inputs
  const handleOtpChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otpValues];
    newOtp[index] = val ? val.slice(-1) : "";
    setOtpValues(newOtp);

    // Auto-advance if digit is typed
    if (val && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otpValues];
      // If box is already empty, erase previous and focus back
      if (!newOtp[index] && index > 0) {
        newOtp[index - 1] = "";
        setOtpValues(newOtp);
        otpRefs[index - 1].current.focus();
      } else {
        newOtp[index] = "";
        setOtpValues(newOtp);
      }
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
          0% { transform: perspective(1000px) rotateY(10deg) rotateX(6deg) translateY(0px); }
          50% { transform: perspective(1000px) rotateY(13deg) rotateX(4deg) translateY(-8px); }
          100% { transform: perspective(1000px) rotateY(10deg) rotateX(6deg) translateY(0px); }
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.15; }
          50% { transform: translateY(-60px) translateX(25px) scale(1.3); opacity: 0.45; }
          100% { transform: translateY(-120px) translateX(-10px) scale(1); opacity: 0; }
        }
        @keyframes borderGlowPulse {
          0% { border-color: rgba(99, 102, 241, 0.25); box-shadow: 0 0 15px rgba(99, 102, 241, 0.1); }
          50% { border-color: rgba(45, 212, 191, 0.45); box-shadow: 0 0 25px rgba(45, 212, 191, 0.2); }
          100% { border-color: rgba(99, 102, 241, 0.25); box-shadow: 0 0 15px rgba(99, 102, 241, 0.1); }
        }
        @keyframes rotateSpinner {
          to { transform: rotate(360deg); }
        }
        .animate-card-border {
          animation: borderGlowPulse 8s infinite alternate ease-in-out;
        }
        .otp-input-field:focus {
          border-color: var(--accent-light) !important;
          box-shadow: 0 0 10px rgba(45, 212, 191, 0.3) !important;
        }
        @media (max-width: 850px) {
          .left-panel { display: none !important; }
          .right-panel { width: 100% !important; flex: 1 !important; }
        }
      `}</style>

      {/* Floating Particles Overlay */}
      <div style={styles.particlesContainer}>
        {Array.from({ length: 15 }).map((_, idx) => {
          const size = Math.random() * 5 + 3;
          return (
            <div
              key={idx}
              style={{
                ...styles.particle,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 80 + 10}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDuration: `${Math.random() * 8 + 6}s`,
                animationDelay: `${Math.random() * -5}s`,
              }}
            />
          );
        })}
      </div>

      {/* Local Inbox OTP Preview Notification Toast */}
      {showOtpToast && (
        <div style={styles.otpToast}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#2DD4BF", letterSpacing: "0.5px" }}>
              📬 SIMULATED MAILBOX
            </span>
            <button onClick={() => setShowOtpToast(false)} style={styles.toastCloseBtn}>✕</button>
          </div>
          <div style={{ fontSize: "12px", color: "#E2E8F0", lineHeight: "1.4" }}>
            <div><strong>To:</strong> <span style={{ color: "#94A3B8" }}>{forgotEmail}</span></div>
            <div><strong>From:</strong> <span style={{ color: "#94A3B8" }}>security@kineticlens.com</span></div>
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "6px", marginBottom: "6px" }}>
              <strong>Subject:</strong> Password Reset Verification Code
            </div>
            <div style={{ marginTop: "6px", background: "rgba(10, 15, 25, 0.4)", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              Use OTP code below to override security checks:<br/>
              <span style={styles.toastOtpCode}>{generatedOtp}</span>
            </div>
          </div>
        </div>
      )}

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
        <div className="card animate-card-border" style={styles.card}>
          {/* Brand/Mobile Title */}
          <div style={{ marginBottom: "1rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", letterSpacing: "0.5px", margin: 0 }}>
              <span style={{ color: "var(--accent)" }}>{isLoginMode ? "Welcome Back" : "Create Account"}</span>
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "4px" }}>
              {isLoginMode ? "Log in to resume your training streak" : "Create a local account to start tracking"}
            </p>
          </div>

          {/* Auth Toggle Tabs */}
          <div style={styles.toggleContainer}>
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
          {errorMsg && (
            <div style={styles.errorAlert}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} style={styles.formContainer}>
            
            {/* Standard Login Fields */}
            {isLoginMode ? (
              <>
                <div style={{ marginBottom: "10px" }}>
                  <label style={styles.inputLabel}>Username</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.inputField}
                  />
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <label style={styles.inputLabel}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input"
                      required
                      placeholder="Enter password"
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

                <div style={{ textAlign: "right", marginBottom: "1.25rem" }}>
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
              </>
            ) : (
              /* Registration Fields - Organized in a clean 2-column grid to fit without scroll */
              <div style={styles.registrationGrid}>
                <div style={{ gridColumn: "span 1" }}>
                  <label style={styles.inputLabel}>Username</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="Choose username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.gridInputField}
                  />
                </div>

                <div style={{ gridColumn: "span 1" }}>
                  <label style={styles.inputLabel}>Email Address</label>
                  <input
                    type="email"
                    className="input"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.gridInputField}
                  />
                </div>

                <div style={{ gridColumn: "span 1" }}>
                  <label style={styles.inputLabel}>Display Name</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.gridInputField}
                  />
                </div>

                <div style={{ gridColumn: "span 1" }}>
                  <label style={styles.inputLabel}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input"
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...styles.gridInputField, paddingRight: "35px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{ ...styles.showPassBtn, right: "6px" }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div style={{ gridColumn: "span 1" }}>
                  <label style={styles.inputLabel}>Gender</label>
                  <select
                    className="select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={styles.gridInputField}
                  >
                    <option value="non_binary">Non-Binary / Neutral 🧬</option>
                    <option value="male">Male ♂️</option>
                    <option value="female">Female ♀️</option>
                  </select>
                </div>

                <div style={{ gridColumn: "span 1" }}>
                  <label style={styles.inputLabel}>Experience</label>
                  <select
                    className="select"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    style={styles.gridInputField}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={styles.inputLabel}>Fitness Goal</label>
                  <select
                    className="select"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    style={styles.gridInputField}
                  >
                    <option value="build_muscle">Build Muscle 💪</option>
                    <option value="lose_weight">Fat Loss 🔥</option>
                    <option value="endurance">Endurance ⚡</option>
                    <option value="flexibility">Recovery 🧘</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={styles.submitBtn}
            >
              {isLoginMode ? "🚀 Log In" : "🌟 Complete Registration"}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal (OTP Verification workflow) */}
      {showForgotModal && (
        <div style={styles.modalOverlay}>
          <div className="card" style={styles.modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "16px", margin: 0, color: "var(--text)" }}>🔓 Reset Password</h3>
              <button 
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStep(1);
                  setErrorMsg("");
                  setForgotSuccess("");
                  setShowOtpToast(false);
                }} 
                style={styles.modalCloseX}
              >
                ✕
              </button>
            </div>
            
            <p style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "1rem", lineHeight: "1.4" }}>
              {forgotStep === 1 && "Confirm your account details to dispatch a secure verification code."}
              {forgotStep === 2 && "Enter the 6-digit OTP code sent to your registered email address."}
              {forgotStep === 3 && "Configure a new secure password override for your profile."}
            </p>

            {errorMsg && (
              <div style={{ ...styles.errorAlert, marginBottom: "10px" }}>
                ⚠️ {errorMsg}
              </div>
            )}
            {forgotSuccess && (
              <div style={{ ...styles.successAlert, marginBottom: "10px" }}>
                ✓ {forgotSuccess}
              </div>
            )}

            {/* Step 1: Request Username & Registered Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotPasswordRequest}>
                {isSendingOtp ? (
                  <div style={styles.spinnerContainer}>
                    <div style={styles.spinner}></div>
                    <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>
                      Generating Secure OTP...
                    </span>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: "12px", textAlign: "left" }}>
                      <label style={styles.inputLabel}>Username</label>
                      <input
                        type="text"
                        className="input"
                        required
                        placeholder="Enter username"
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        style={styles.inputField}
                      />
                    </div>
                    <div style={{ marginBottom: "12px", textAlign: "left" }}>
                      <label style={styles.inputLabel}>Registered Email</label>
                      <input
                        type="email"
                        className="input"
                        required
                        placeholder="email@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        style={styles.inputField}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px", borderRadius: "10px", fontSize: "13px" }}>
                      Send Verification Code ➡️
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Step 2: OTP Entry Validation */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div style={styles.otpGrid}>
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      className="otp-input-field"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(e, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      style={styles.otpInput}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "1.25rem" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setForgotStep(1);
                      setErrorMsg("");
                      setForgotSuccess("");
                    }}
                    style={{ flex: 1, padding: "8px", fontSize: "12px", borderRadius: "8px" }}
                  >
                    ⬅ Back
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "8px", fontSize: "12px", borderRadius: "8px" }}>
                    Verify OTP
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Password Override */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPasswordOverride}>
                <div style={{ marginBottom: "10px", textAlign: "left" }}>
                  <label style={styles.inputLabel}>New Password</label>
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
                <div style={{ marginBottom: "15px", textAlign: "left" }}>
                  <label style={styles.inputLabel}>Confirm New Password</label>
                  <input
                    type="password"
                    className="input"
                    required
                    placeholder="Confirm new password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    style={styles.inputField}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px", borderRadius: "10px", fontSize: "13px" }}>
                  Update Password
                </button>
              </form>
            )}
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
    fontFamily: "'Outfit', 'Inter', sans-serif",
    position: "relative"
  },
  particlesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 1
  },
  particle: {
    position: "absolute",
    backgroundColor: "var(--accent-light)",
    borderRadius: "50%",
    animationName: "floatParticle",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out"
  },
  leftPanel: {
    flex: "1.2",
    backgroundImage: 'linear-gradient(135deg, rgba(9, 13, 22, 0.86), rgba(21, 28, 44, 0.9)), url("https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    position: "relative",
    overflow: "hidden",
    borderRight: "1.5px solid rgba(99, 102, 241, 0.18)",
    zIndex: 2
  },
  glowBlob1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
    top: "-10%",
    left: "-10%",
    animation: "pulseGlow 8s infinite ease-in-out"
  },
  glowBlob2: {
    position: "absolute",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)",
    bottom: "-10%",
    right: "-10%",
    animation: "pulseGlow 10s infinite ease-in-out 2s"
  },
  visualContent: {
    position: "relative",
    zIndex: 3,
    textAlign: "center",
    maxWidth: "460px",
    animation: "slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  mockup3DFrame: {
    width: "380px",
    height: "240px",
    borderRadius: "24px",
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.75)",
    transform: "perspective(1000px) rotateY(10deg) rotateX(6deg)",
    animation: "float3D 6s infinite ease-in-out",
    border: "1.5px solid rgba(255, 255, 255, 0.1)",
    margin: "0 auto 2.5rem"
  },
  glassOverlay: {
    position: "absolute",
    bottom: "16px",
    left: "16px",
    right: "16px",
    background: "rgba(10, 15, 25, 0.82)",
    backdropFilter: "blur(16px)",
    border: "1.5px solid rgba(255, 255, 255, 0.08)",
    padding: "10px 14px",
    borderRadius: "16px",
    color: "#FFFFFF",
    textAlign: "left"
  },
  visualTitle: {
    fontSize: "2.8rem",
    fontWeight: "900",
    letterSpacing: "4px",
    background: "linear-gradient(135deg, #FFFFFF 30%, #818CF8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "1rem",
    fontFamily: "'Outfit', sans-serif"
  },
  visualSubtitle: {
    fontSize: "13.5px",
    color: "#94A3B8",
    lineHeight: "1.65",
    textAlign: "center",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif"
  },
  rightPanel: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "var(--bg)",
    overflow: "hidden",
    position: "relative",
    zIndex: 2
  },
  card: {
    width: "100%",
    maxWidth: "380px",
    maxHeight: "92vh",
    padding: "1.75rem 1.5rem",
    background: "var(--card)",
    border: "1.5px solid var(--border)",
    boxShadow: "var(--shadow)",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backdropFilter: "blur(20px)"
  },
  toggleContainer: {
    display: "flex",
    background: "var(--bg)",
    padding: "4px",
    borderRadius: "12px",
    marginBottom: "1rem",
    border: "1px solid var(--border)"
  },
  toggleBtn: {
    flex: 1,
    border: "none",
    padding: "9px 0",
    fontSize: "12.5px",
    fontWeight: "700",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    fontFamily: "'Outfit', sans-serif"
  },
  errorAlert: {
    fontSize: "11px",
    color: "var(--danger)",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid var(--danger)",
    padding: "8px 12px",
    borderRadius: "10px",
    marginBottom: "1rem",
    textAlign: "left",
    fontWeight: "bold",
    animation: "slideIn 0.3s ease"
  },
  successAlert: {
    fontSize: "11px",
    color: "var(--success)",
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid var(--success)",
    padding: "8px 12px",
    borderRadius: "10px",
    marginBottom: "1rem",
    textAlign: "left",
    fontWeight: "bold",
    animation: "slideIn 0.3s ease"
  },
  formContainer: {
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden"
  },
  inputLabel: {
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    fontWeight: "700",
    color: "var(--muted)",
    marginBottom: "2px",
    display: "block"
  },
  inputField: {
    padding: "8px 12px",
    fontSize: "13px",
    marginTop: "3px",
    marginBottom: "4px",
    borderRadius: "10px",
    border: "1.5px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    width: "100%",
    outline: "none",
    transition: "all 0.2s ease"
  },
  registrationGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px 12px",
    marginBottom: "10px",
    flex: 1,
    overflowY: "auto",
    paddingRight: "4px"
  },
  gridInputField: {
    padding: "7px 10px",
    fontSize: "12.5px",
    borderRadius: "8px",
    border: "1.5px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    width: "100%",
    outline: "none",
    marginTop: "2px"
  },
  showPassBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    fontSize: "13px",
    cursor: "pointer",
    padding: "4px",
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  forgotPassLink: {
    fontSize: "11px",
    color: "var(--accent-light)",
    fontWeight: "700",
    cursor: "pointer",
    textDecoration: "none",
    transition: "color 0.2s ease"
  },
  submitBtn: {
    width: "100%",
    padding: "11px",
    marginTop: "auto",
    fontSize: "13px",
    fontWeight: "700",
    borderRadius: "12px",
    cursor: "pointer",
    fontFamily: "'Outfit', sans-serif"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(6, 9, 15, 0.75)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modalCard: {
    width: "100%",
    maxWidth: "360px",
    padding: "1.75rem 1.5rem",
    background: "var(--card)",
    border: "1.5px solid var(--border)",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
    textAlign: "center",
    animation: "slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  modalCloseX: {
    background: "transparent",
    border: "none",
    fontSize: "14px",
    color: "var(--muted)",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  spinnerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "2rem 0"
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid rgba(45, 212, 191, 0.1)",
    borderTop: "3px solid #2DD4BF",
    borderRadius: "50%",
    animation: "rotateSpinner 0.8s linear infinite"
  },
  otpGrid: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    margin: "1.25rem 0"
  },
  otpInput: {
    width: "42px",
    height: "46px",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "bold",
    borderRadius: "10px",
    border: "2px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    outline: "none",
    transition: "all 0.2s ease"
  },
  otpToast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "320px",
    background: "rgba(24, 32, 50, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1.5px solid rgba(45, 212, 191, 0.25)",
    padding: "14px",
    borderRadius: "16px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
    zIndex: 9999,
    animation: "slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  toastCloseBtn: {
    background: "transparent",
    border: "none",
    color: "var(--muted)",
    cursor: "pointer",
    fontSize: "12px"
  },
  toastOtpCode: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2DD4BF",
    letterSpacing: "4px",
    display: "inline-block",
    marginTop: "6px",
    fontFamily: "monospace"
  }
};
