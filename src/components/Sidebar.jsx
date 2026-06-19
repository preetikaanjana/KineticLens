import React from "react";

const navLinks = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "trainer", label: "AI Posture Trainer", icon: "⚡" },
  { id: "planner", label: "Workout Planner", icon: "📋" },
  { id: "calendar", label: "Monthly Calendar", icon: "🗓️" },
  { id: "cyclesync", label: "Cycle Syncing", icon: "🔄" },
  { id: "recovery", label: "Recovery & Stretch", icon: "🧘‍♂️" },
  { id: "tracker", label: "Body Log Tracker", icon: "📏" },
  { id: "achievements", label: "Achievements", icon: "🏆" }
];

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, theme, toggleTheme }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          <span style={styles.logoEmoji}>⚡</span>
          <h2 style={styles.logoText}>
            <span style={{ color: "var(--accent)" }}>KINETIC</span>
            <span style={{ color: "var(--accent-light)" }}>LENS</span>
          </h2>
        </div>
        <button
          onClick={toggleTheme}
          style={styles.themeToggleBtn}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <nav style={styles.nav}>
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          const linkColor = "#9CA3AF"; // High-contrast light grey on dark sidebar
          const activeBg = "rgba(129, 140, 248, 0.12)"; // Soft indigo active highlight
          const activeColor = "var(--accent)";
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={{
                ...styles.navLink,
                color: isActive ? activeColor : linkColor,
                backgroundColor: isActive ? activeBg : "transparent"
              }}
            >
              <span style={styles.icon}>{link.icon}</span>
              <span style={styles.label}>{link.label}</span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <div style={styles.divider} />
        <div style={styles.userSection}>
          <div style={styles.avatar}>{user?.name ? user.name[0].toUpperCase() : "A"}</div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={styles.username} title={user?.name}>{user?.name || "Active Athlete"}</div>
            <div style={styles.userRole}>
              {user?.level ? `${user.level.toUpperCase()} · ${user.goal.split("_")[0].toUpperCase()}` : "Level 1 Trainer"}
            </div>
          </div>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    backgroundColor: "var(--sidebar)",
    borderRight: "1.5px solid rgba(99, 102, 241, 0.18)",
    display: "flex",
    flexDirection: "column",
    padding: "1.75rem 1.25rem",
    minHeight: "100vh",
    position: "sticky",
    top: 0,
    boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
    zIndex: 100
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "2rem",
    paddingLeft: "0.5rem"
  },
  logoEmoji: {
    fontSize: "1.75rem"
  },
  logoText: {
    fontSize: "1.35rem",
    fontWeight: 700,
    letterSpacing: "0.5px",
    fontFamily: "'Outfit', sans-serif"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    padding: "11px 14px",
    borderRadius: "12px",
    background: "transparent",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 550,
    textAlign: "left",
    transition: "all 0.2s ease",
    width: "100%",
    position: "relative",
    fontFamily: "'Inter', sans-serif"
  },
  navLinkActive: {
    backgroundColor: "rgba(129, 140, 248, 0.12)",
    color: "var(--accent)"
  },
  icon: {
    marginRight: "12px",
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    flex: 1
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: "20%",
    height: "60%",
    width: "3px",
    backgroundColor: "var(--accent)",
    borderRadius: "0 4px 4px 0"
  },
  footer: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(99, 102, 241, 0.15)"
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0.25rem 0.5rem"
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "var(--accent)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px"
  },
  username: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#FFFFFF",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  userRole: {
    fontSize: "11px",
    color: "#9CA3AF",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1.5px solid rgba(239, 68, 68, 0.2)",
    color: "#EF4444",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "center",
    transition: "all 0.2s ease",
    marginTop: "4px",
    fontFamily: "'Outfit', sans-serif"
  },
  themeToggleBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    outline: "none"
  }
};
