import { useState, useEffect } from "react";
import { getUserActivities } from "../api/activityApi";

const ACTIVITY_ICONS = {
  RUNNING: "🏃", WALKING: "🚶", CYCLING: "🚴", SWIMMING: "🏊",
  WEIGHT_TRAINING: "🏋️", YOGA: "🧘", HIIT: "🔥", PILATES: "🤸", OTHER: "⚡",
};
const COLORS = ["#D4FF00", "#FF4D00", "#00C2FF", "#FF0080", "#FF4D00", "#D4FF00", "#00C2FF"];

const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fillBar {
    from { height: 0%; }
    to   { height: var(--bar-h); }
  }
  .bar-animated { animation: fillBar 0.8s ease both; }
  .dash-card { animation: fadeUp 0.4s ease both; }
  .water-btn { transition: all 0.2s; border: none; cursor: pointer; }
  .water-btn:hover { transform: scale(1.05); }
  .water-btn:active { transform: scale(0.95); }
  .activity-row { transition: all 0.2s; }
  .activity-row:hover { background: #222 !important; transform: translateX(4px); }
  .chart-bar-wrap:hover .bar-tooltip { opacity: 1 !important; transform: translateY(0) !important; }
`;

function WaterTracker() {
  const GOAL = 8;
  const [glasses, setGlasses] = useState(() => {
    try {
      const saved = localStorage.getItem("waterToday");
      const date = localStorage.getItem("waterDate");
      const today = new Date().toDateString();
      if (date === today && saved) return parseInt(saved);
    } catch {}
    return 0;
  });

  const addGlass = () => {
    if (glasses >= GOAL) return;
    const next = glasses + 1;
    setGlasses(next);
    try { localStorage.setItem("waterToday", next); localStorage.setItem("waterDate", new Date().toDateString()); } catch {}
  };

  const removeGlass = () => {
    if (glasses <= 0) return;
    const next = glasses - 1;
    setGlasses(next);
    try { localStorage.setItem("waterToday", next); } catch {}
  };

  const pct = Math.round((glasses / GOAL) * 100);
  const fillColor = pct < 40 ? "#FF4D00" : pct < 70 ? "#00C2FF" : "#D4FF00";

  return (
    <div className="card dash-card" style={{ animationDelay: "0.3s" }}>
      <div className="card-title">💧 Water Intake</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ position: "relative", width: 64, flexShrink: 0 }}>
          <svg width="64" height="120" viewBox="0 0 64 120">
            <rect x="8" y="20" width="48" height="88" rx="10" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
            <rect x="20" y="8" width="24" height="16" rx="4" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
            <rect x="18" y="2" width="28" height="10" rx="4" fill={fillColor} />
            <clipPath id="bottleClip"><rect x="9" y="21" width="46" height="86" rx="9" /></clipPath>
            <g clipPath="url(#bottleClip)">
              <rect x="9" y={21 + 86 * (1 - pct / 100)} width="46" height={86 * (pct / 100)} fill={fillColor} opacity="0.8" style={{ transition: "all 0.5s ease" }} />
              <rect x="9" y={21 + 86 * (1 - pct / 100) - 4} width="46" height="8" fill={fillColor} opacity="0.4" style={{ transition: "all 0.5s ease" }} />
            </g>
            <text x="32" y="75" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Outfit, sans-serif">{pct}%</text>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 900, color: fillColor, lineHeight: 1 }}>
            {glasses}<span style={{ fontSize: 20, color: "var(--muted)" }}>/{GOAL}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>glasses today</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {Array.from({ length: GOAL }).map((_, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: 8, background: i < glasses ? fillColor : "#1a1a1a", border: `1px solid ${i < glasses ? fillColor : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all 0.3s ease", transitionDelay: `${i * 0.05}s` }}>
                {i < glasses ? "💧" : ""}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="water-btn" onClick={addGlass} disabled={glasses >= GOAL} style={{ flex: 1, padding: "10px", borderRadius: 12, background: glasses >= GOAL ? "#1a1a1a" : "var(--electric)", color: glasses >= GOAL ? "var(--muted)" : "#000", fontWeight: 700, fontSize: 13 }}>+ Add Glass</button>
            <button className="water-btn" onClick={removeGlass} disabled={glasses <= 0} style={{ padding: "10px 14px", borderRadius: 12, background: "#1a1a1a", color: glasses <= 0 ? "var(--muted)" : "var(--text)", fontWeight: 700, fontSize: 13 }}>−</button>
          </div>
          {glasses >= GOAL && <div style={{ marginTop: 10, fontSize: 12, color: "var(--neon)", fontWeight: 600 }}>🎉 Goal reached! Great hydration today!</div>}
        </div>
      </div>
    </div>
  );
}

function ProgressChart({ activities }) {
  const [view, setView] = useState("calories");
  const last7 = [...activities].slice(0, 7).reverse();
  const maxVal = Math.max(...last7.map(a => view === "calories" ? (a.caloriesBurnt || 0) : (a.duration || 0)), 1);
  const views = [{ id: "calories", label: "Calories", color: "#FF4D00" }, { id: "duration", label: "Duration", color: "#00C2FF" }];

  return (
    <div className="card dash-card" style={{ animationDelay: "0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="card-title" style={{ margin: 0 }}>📊 Progress</div>
        <div style={{ display: "flex", gap: 6 }}>
          {views.map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{ padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer", background: view === v.id ? v.color : "#1a1a1a", color: view === v.id ? "#000" : "var(--muted)", fontSize: 11, fontWeight: 700, transition: "all 0.2s", fontFamily: "Outfit, sans-serif" }}>{v.label}</button>
          ))}
        </div>
      </div>
      {last7.length === 0 ? (
        <div className="empty-state" style={{ padding: 32 }}><div className="empty-icon">📊</div><div className="empty-text">Log workouts to see your progress!</div></div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, marginBottom: 8 }}>
            {last7.map((a, i) => {
              const val = view === "calories" ? (a.caloriesBurnt || 0) : (a.duration || 0);
              const pct = Math.max((val / maxVal) * 100, 2);
              const color = views.find(v => v.id === view)?.color;
              return (
                <div key={i} className="chart-bar-wrap" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", position: "relative" }}>
                  <div className="bar-tooltip" style={{ position: "absolute", top: -32, left: "50%", transform: "translateX(-50%) translateY(4px)", background: "#222", borderRadius: 8, padding: "4px 8px", fontSize: 11, fontWeight: 700, color, whiteSpace: "nowrap", opacity: 0, transition: "all 0.2s", pointerEvents: "none", border: `1px solid ${color}44` }}>{val}{view === "calories" ? " kcal" : " min"}</div>
                  <div className="bar-animated" style={{ width: "100%", height: `${pct}%`, background: `linear-gradient(180deg, ${color}, ${color}88)`, borderRadius: "6px 6px 0 0", "--bar-h": `${pct}%`, animationDelay: `${i * 0.08}s`, cursor: "pointer" }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {last7.map((a, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>{(a.type || "?").slice(0, 3)}</div>)}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: "var(--muted)" }}>Last {last7.length} workouts • {view === "calories" ? "Calories burned" : "Duration in minutes"}</div>
        </>
      )}
    </div>
  );
}

function ActivityBreakdown({ activities }) {
  const counts = {};
  activities.forEach(a => { counts[a.type] = (counts[a.type] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = activities.length;

  return (
    <div className="card dash-card" style={{ animationDelay: "0.25s" }}>
      <div className="card-title">🏆 Workout Breakdown</div>
      {entries.length === 0 ? (
        <div className="empty-state" style={{ padding: 24 }}><div className="empty-icon">🏋️</div><div className="empty-text">No workouts yet!</div></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.map(([type, count], i) => {
            const pct = Math.round((count / total) * 100);
            return (
              <div key={type}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                  <span>{ACTIVITY_ICONS[type] || "⚡"} {type?.replace(/_/g, " ")}</span>
                  <span style={{ color: "var(--muted)" }}>{count}x • {pct}%</span>
                </div>
                <div style={{ background: "#1a1a1a", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: COLORS[i % COLORS.length], width: `${pct}%`, transition: "width 1s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ user, setPage }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserActivities().then(setActivities).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalCalories = activities.reduce((s, a) => s + (a.caloriesBurnt || 0), 0);
  const totalDuration = activities.reduce((s, a) => s + (a.duration || 0), 0);
  const totalWorkouts = activities.length;
  const avgCalories = totalWorkouts ? Math.round(totalCalories / totalWorkouts) : 0;

  const stats = [
    { icon: "🏋️", value: totalWorkouts, label: "Workouts", color: "var(--neon)" },
    { icon: "🔥", value: totalCalories.toLocaleString(), label: "Calories Burned", color: "var(--fire)" },
    { icon: "⏱️", value: `${totalDuration}m`, label: "Total Duration", color: "var(--electric)" },
    { icon: "⚡", value: avgCalories, label: "Avg Calories", color: "var(--magenta)" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="topbar">
        <div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Welcome back 👋</div>
          <div className="topbar-title">{user?.firstName ? user.firstName.toUpperCase() : "ATHLETE"}</div>
        </div>
        <div className="streak-badge">
          <div className="streak-num">🔥 {totalWorkouts}</div>
          <div className="streak-label">Total Sessions</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div className="stat-card dash-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <ProgressChart activities={activities} />
        <ActivityBreakdown activities={activities} />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <WaterTracker />
        <div className="card dash-card" style={{ animationDelay: "0.35s" }}>
          <div className="card-title">⚡ Recent Activities</div>
          {loading ? <div className="loading"><div className="spinner" /></div>
            : activities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏃</div>
                <div className="empty-text">No activities logged yet!</div>
                <button className="btn-primary" style={{ marginTop: 16, width: "auto", padding: "10px 24px" }} onClick={() => setPage("log")}>Log First Workout</button>
              </div>
            ) : (
              <div className="activity-list">
                {activities.slice(0, 4).map((a, i) => (
                  <div className="activity-item activity-row" key={a.id || i}>
                    <div className="act-icon" style={{ background: `${COLORS[i % COLORS.length]}22` }}>{ACTIVITY_ICONS[a.type] || "⚡"}</div>
                    <div className="act-info">
                      <div className="act-name">{a.type?.replace(/_/g, " ") || "Activity"}</div>
                      <div className="act-meta">{a.duration} min • {new Date(a.startTime).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div className="act-calories">{a.caloriesBurnt} <span style={{ fontSize: 11, color: "var(--muted)" }}>kcal</span></div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      <div className="card dash-card" style={{ textAlign: "center", padding: 32, animationDelay: "0.4s" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, marginBottom: 8 }}>READY TO CRUSH IT? 💪</div>
        <div style={{ color: "var(--muted)", marginBottom: 20, fontSize: 14 }}>Log your workout and get AI-powered insights</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn-primary" style={{ width: "auto", padding: "14px 36px" }} onClick={() => setPage("log")}>LOG WORKOUT</button>
          <button className="btn-secondary" onClick={() => setPage("recommend")}>🤖 AI Insights</button>
        </div>
      </div>
    </>
  );
}
