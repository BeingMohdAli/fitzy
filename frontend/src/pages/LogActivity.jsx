import { useState } from "react";
import { trackActivity, ACTIVITY_TYPES } from "../api/activityApi";
import keycloak from "../keycloak";

const css = `
  @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.8; } }
  @keyframes dot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
  .ai-pulse { animation: pulse 1.5s ease-in-out infinite; }
  .dot1 { animation: dot 1.4s ease-in-out infinite; }
  .dot2 { animation: dot 1.4s ease-in-out 0.2s infinite; }
  .dot3 { animation: dot 1.4s ease-in-out 0.4s infinite; }
`;

const AI_STEPS = [
  { icon: "📡", text: "Sending workout data to AI..." },
  { icon: "🧠", text: "Gemini AI analyzing your performance..." },
  { icon: "💪", text: "Generating improvement tips..." },
  { icon: "💡", text: "Creating personalized suggestions..." },
  { icon: "🛡️", text: "Checking safety recommendations..." },
  { icon: "✅", text: "Recommendations ready!" },
];

const ICONS = { RUNNING: "🏃", WALKING: "🚶", CYCLING: "🚴", SWIMMING: "🏊", WEIGHT_TRAINING: "🏋️", YOGA: "🧘", HIIT: "🔥", PILATES: "🤸", OTHER: "⚡" };

function AILoadingScreen({ activityType, onDone }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= AI_STEPS.length - 1) { clearInterval(interval); setTimeout(onDone, 5000); return s; }
        return s + 1;
      });
      setProgress(p => Math.min(p + 100 / AI_STEPS.length, 100));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40 }}>
      <div className="ai-pulse" style={{ width: 120, height: 120, borderRadius: 32, background: "linear-gradient(135deg, rgba(0,194,255,0.2), rgba(212,255,0,0.1))", border: "2px solid rgba(0,194,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, marginBottom: 28, boxShadow: "0 0 40px rgba(0,194,255,0.2)" }}>
        {AI_STEPS[step].icon}
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(212,255,0,0.1)", border: "1px solid rgba(212,255,0,0.3)", borderRadius: 20, padding: "8px 20px", marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>{ICONS[activityType]}</span>
          <span style={{ color: "var(--neon)", fontWeight: 700, fontSize: 13 }}>{activityType?.replace(/_/g, " ")} LOGGED ✅</span>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>AI IS ANALYZING</div>
        <div style={{ color: "var(--muted)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          Powered by Gemini AI
          <span className="dot1" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--electric)", display: "inline-block", margin: "0 2px" }} />
          <span className="dot2" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--electric)", display: "inline-block", margin: "0 2px" }} />
          <span className="dot3" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--electric)", display: "inline-block", margin: "0 2px" }} />
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: 400, marginBottom: 24 }}>
        <div style={{ background: "#1a1a1a", borderRadius: 8, height: 8, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ height: "100%", borderRadius: 8, background: "linear-gradient(90deg, var(--electric), var(--neon))", width: `${progress}%`, transition: "width 0.8s ease", boxShadow: "0 0 10px rgba(0,194,255,0.5)" }} />
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{Math.round(progress)}% complete</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 360 }}>
        {AI_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 12, background: i < step ? "rgba(212,255,0,0.05)" : i === step ? "rgba(0,194,255,0.08)" : "transparent", border: i === step ? "1px solid rgba(0,194,255,0.2)" : "1px solid transparent", opacity: i > step ? 0.3 : 1, transition: "all 0.4s ease" }}>
            <span style={{ fontSize: 16 }}>{i < step ? "✅" : s.icon}</span>
            <span style={{ fontSize: 13, color: i < step ? "var(--neon)" : i === step ? "var(--electric)" : "var(--muted)", fontWeight: i === step ? 600 : 400 }}>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LogActivity({ setPage }) {
  const [form, setForm] = useState({
    type: "RUNNING", duration: "", caloriesBurnt: "",
    startTime: new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [loggedType, setLoggedType] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.duration || !form.caloriesBurnt) { setError("Please fill in all fields."); return; }
    setError(null);
    setLoading(true);
    try {
      const payload = {
        userId: keycloak.tokenParsed?.sub,
        type: form.type,
        duration: parseInt(form.duration),
        caloriesBurnt: parseInt(form.caloriesBurnt),
        startTime: form.startTime + ":00",
        additionalMetrics: {},
      };
      await trackActivity(payload);
      setLoggedType(form.type);
      setAiLoading(true);
    } catch (e) {
      setError("Failed to log activity. Make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (aiLoading) return (<><style>{css}</style><AILoadingScreen activityType={loggedType} onDone={() => setPage("recommend")} /></>);

  return (
    <>
      <style>{css}</style>
      <div className="topbar">
        <div><div className="topbar-title">LOG WORKOUT</div><div className="topbar-sub">Track your activity and get AI insights</div></div>
        <button className="btn-secondary" onClick={() => setPage("activities")}>← Back</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="card">
          <div className="card-title">Workout Details</div>
          <div className="form-group">
            <label className="form-label">Activity Type</label>
            <select className="form-select" name="type" value={form.type} onChange={handleChange}>
              {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{ICONS[t]} {t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Duration (minutes)</label>
            <input className="form-input" type="number" name="duration" placeholder="e.g. 45" value={form.duration} onChange={handleChange} min="1" />
          </div>
          <div className="form-group">
            <label className="form-label">Calories Burned</label>
            <input className="form-input" type="number" name="caloriesBurnt" placeholder="e.g. 320" value={form.caloriesBurnt} onChange={handleChange} min="1" />
          </div>
          <div className="form-group">
            <label className="form-label">Start Time (IST)</label>
            <input className="form-input" type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} />
          </div>
          {error && <div style={{ color: "#FF4D00", fontSize: 13, marginBottom: 16, padding: "10px 14px", background: "rgba(255,77,0,0.1)", borderRadius: 10 }}>⚠️ {error}</div>}
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? "LOGGING..." : "LOG WORKOUT 🔥"}</button>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card-title">Preview</div>
          <div style={{ background: "linear-gradient(135deg, var(--fire), var(--magenta))", borderRadius: 20, padding: 28, textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{ICONS[form.type]}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900, letterSpacing: 2, color: "#fff" }}>{form.type.replace(/_/g, " ")}</div>
          </div>
          {[
            { label: "Duration", val: form.duration ? `${form.duration} min` : "—" },
            { label: "Calories", val: form.caloriesBurnt ? `${form.caloriesBurnt} kcal` : "—" },
            { label: "Date", val: form.startTime ? new Date(form.startTime).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST' : "—" },
          ].map(({ label, val }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>{label}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{val}</span>
            </div>
          ))}
          <div style={{ marginTop: "auto", padding: "14px", background: "rgba(212,255,0,0.05)", borderRadius: 12, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
            🤖 After logging, Gemini AI will analyze your workout and show you personalized recommendations!
          </div>
        </div>
      </div>
    </>
  );
}
