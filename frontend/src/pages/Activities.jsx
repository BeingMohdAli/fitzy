import { useState, useEffect } from "react";
import { getUserActivities } from "../api/activityApi";
import { getActivityRecommendation } from "../api/recommendationApi";

const ICONS = {
  RUNNING: "🏃", WALKING: "🚶", CYCLING: "🚴", SWIMMING: "🏊",
  WEIGHT_TRAINING: "🏋️", YOGA: "🧘", HIIT: "🔥", PILATES: "🤸", OTHER: "⚡",
};
const COLORS = ["#D4FF00", "#FF4D00", "#00C2FF", "#FF0080", "#FF4D00"];

export default function Activities({ user, setPage }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rec, setRec] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    getUserActivities().then(setActivities).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSelect = async (activity) => {
    setSelected(activity);
    setRec(null);
    setRecLoading(true);
    try {
      const r = await getActivityRecommendation(activity.id);
      setRec(r);
    } catch {
      setRec(null);
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">ACTIVITIES</div>
          <div className="topbar-sub">{activities.length} workouts logged</div>
        </div>
        <button className="btn-primary" style={{ width: "auto", padding: "12px 28px" }} onClick={() => setPage("log")}>+ LOG NEW</button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">All Workouts</div>
          {loading ? <div className="loading"><div className="spinner" /></div>
            : activities.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🏃</div><div className="empty-text">No activities yet. Log your first workout!</div></div>
            ) : (
              <div className="activity-list">
                {activities.map((a, i) => (
                  <div className="activity-item" key={a.id || i} onClick={() => handleSelect(a)}
                    style={{ border: selected?.id === a.id ? "1px solid var(--neon)" : "1px solid transparent", cursor: "pointer" }}>
                    <div className="act-icon" style={{ background: `${COLORS[i % COLORS.length]}22` }}>{ICONS[a.type] || "⚡"}</div>
                    <div className="act-info">
                      <div className="act-name">{a.type?.replace(/_/g, " ")}</div>
                      <div className="act-meta">{a.duration} min • {new Date(a.startTime).toLocaleDateString()}</div>
                    </div>
                    <div className="act-calories">{a.caloriesBurnt}<span style={{ fontSize: 11, color: "var(--muted)" }}> kcal</span></div>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="card">
          {!selected ? (
            <div className="empty-state" style={{ paddingTop: 80 }}>
              <div className="empty-icon">👆</div>
              <div className="empty-text">Select a workout to see AI recommendations</div>
            </div>
          ) : (
            <>
              <div className="card-title">Workout Detail</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Type", val: selected.type?.replace(/_/g, " ") },
                  { label: "Duration", val: `${selected.duration} min` },
                  { label: "Calories", val: `${selected.caloriesBurnt} kcal` },
                  { label: "Date", val: new Date(selected.startTime).toLocaleDateString() },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: "var(--surface2)", borderRadius: 12, padding: "12px 16px" }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: 1, color: "var(--electric)", marginBottom: 12 }}>🤖 AI RECOMMENDATIONS</div>

              {recLoading ? <div className="loading"><div className="spinner" /></div>
                : !rec ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No recommendation available for this activity yet.</div>
                : (
                  <div className="rec-card" style={{ marginBottom: 0 }}>
                    {rec.recommendations && <div className="rec-section"><div className="rec-section-title">Summary</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{rec.recommendations}</div></div>}
                    {rec.improvements?.length > 0 && <div className="rec-section"><div className="rec-section-title">💪 Improvements</div>{rec.improvements.map((r, i) => <span key={i} className="rec-tag fire">{r}</span>)}</div>}
                    {rec.suggestions?.length > 0 && <div className="rec-section"><div className="rec-section-title">💡 Suggestions</div>{rec.suggestions.map((r, i) => <span key={i} className="rec-tag">{r}</span>)}</div>}
                    {rec.safety?.length > 0 && <div className="rec-section"><div className="rec-section-title">🛡️ Safety</div>{rec.safety.map((r, i) => <span key={i} className="rec-tag safe">{r}</span>)}</div>}
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
