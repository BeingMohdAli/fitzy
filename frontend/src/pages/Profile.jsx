import { useState, useEffect } from "react";
import { getUserProfile } from "../api/userApi";
import { getUserActivities } from "../api/activityApi";
import keycloak from "../keycloak";

export default function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = keycloak.tokenParsed?.sub;
    if (userId) {
      Promise.all([
        getUserProfile(userId).catch(() => null),
        getUserActivities().catch(() => []),
      ]).then(([p, a]) => {
        setProfile(p);
        setActivities(a);
      }).finally(() => setLoading(false));
    }
  }, []);

  const totalCal = activities.reduce((s, a) => s + (a.caloriesBurnt || 0), 0);
  const totalMin = activities.reduce((s, a) => s + (a.duration || 0), 0);
  const initials = user
      ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"
      : "U";

  return (
      <>
        <div className="topbar">
          <div className="topbar-title">PROFILE</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>

          {/* LEFT - AVATAR CARD */}
          <div className="card" style={{ textAlign: "center", padding: 36 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, var(--fire), var(--magenta))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, color: "#fff", margin: "0 auto 16px" }}>{initials}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, letterSpacing: 1 }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>{user?.email}</div>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Workouts", val: activities.length },
                { label: "Calories Burned", val: totalCal.toLocaleString() },
                { label: "Minutes Active", val: totalMin },
              ].map(({ label, val }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface2)", borderRadius: 10 }}>
                    <span style={{ color: "var(--muted)", fontSize: 13 }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--neon)" }}>{val}</span>
                  </div>
              ))}
            </div>
            <button className="btn-secondary" style={{ marginTop: 20, width: "100%" }} onClick={() => keycloak.logout()}>🚪 Logout</button>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ACCOUNT INFO */}
            <div className="card">
              <div className="card-title">Account Info</div>
              {loading ? <div className="loading"><div className="spinner" /></div> : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      { label: "First Name", val: user?.firstName || "—" },
                      { label: "Last Name", val: user?.lastName || "—" },
                      { label: "Email", val: user?.email || "—" },
                      { label: "Keycloak ID", val: user?.id ? `${user.id.slice(0, 8)}...` : "—" },
                      { label: "Member Since", val: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—" },
                      { label: "Role", val: "USER" },
                    ].map(({ label, val }) => (
                        <div key={label} style={{ background: "var(--surface2)", borderRadius: 12, padding: "14px 16px" }}>
                          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 14, fontWeight: 500, wordBreak: "break-all" }}>{val}</div>
                        </div>
                    ))}
                  </div>
              )}
            </div>

            {/* ACHIEVEMENTS */}
            <div className="card">
              <div className="card-title">🏆 Achievements</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { icon: "🔥", label: "First Workout", desc: "Logged first session", unlocked: activities.length >= 1 },
                  { icon: "💪", label: "5 Workouts", desc: "Consistency is key", unlocked: activities.length >= 5 },
                  { icon: "⚡", label: "10 Workouts", desc: "Building the habit", unlocked: activities.length >= 10 },
                  { icon: "🏃", label: "25 Workouts", desc: "Serious athlete", unlocked: activities.length >= 25 },
                  { icon: "🏆", label: "1000 Calories", desc: "Calorie crusher", unlocked: totalCal >= 1000 },
                  { icon: "🌟", label: "5000 Calories", desc: "Fitness warrior", unlocked: totalCal >= 5000 },
                  { icon: "💎", label: "10000 Calories", desc: "Elite performer", unlocked: totalCal >= 10000 },
                  { icon: "⏱️", label: "60 Min Session", desc: "Endurance master", unlocked: activities.some(a => a.duration >= 60) },
                  { icon: "🧘", label: "Yoga Session", desc: "Mind and body", unlocked: activities.some(a => a.type === "YOGA") },
                  { icon: "🏊", label: "Swimmer", desc: "Made a splash", unlocked: activities.some(a => a.type === "SWIMMING") },
                ].map(({ icon, label, desc, unlocked }) => (
                    <div key={label} style={{
                      padding: "16px",
                      borderRadius: 16,
                      background: unlocked ? "rgba(212,255,0,0.1)" : "var(--surface2)",
                      border: `1px solid ${unlocked ? "var(--neon)" : "transparent"}`,
                      textAlign: "center",
                      opacity: unlocked ? 1 : 0.4,
                      minWidth: 110,
                      position: "relative",
                      transition: "all 0.3s ease",
                    }}>
                      {unlocked && (
                          <div style={{
                            position: "absolute", top: -6, right: -6,
                            background: "var(--neon)", borderRadius: "50%",
                            width: 18, height: 18,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, color: "#000", fontWeight: 900,
                          }}>✓</div>
                      )}
                      <div style={{ fontSize: 32 }}>{icon}</div>
                      <div style={{ fontSize: 12, marginTop: 6, color: unlocked ? "var(--neon)" : "var(--muted)", fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: 10, marginTop: 2, color: "var(--muted)" }}>{desc}</div>
                    </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </>
  );
}