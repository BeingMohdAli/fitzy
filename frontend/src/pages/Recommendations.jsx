import { useState, useEffect } from "react";
import { getUserRecommendations } from "../api/recommendationApi";
import keycloak from "../keycloak";

const css = `
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(0,194,255,0.3); } 50% { box-shadow: 0 0 20px 4px rgba(0,194,255,0.15); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .rec-card-anim { animation: fadeSlideUp 0.4s ease both; }
  .rec-item-anim { animation: fadeSlideUp 0.3s ease both; }
  .ai-glow { animation: pulseGlow 2.5s ease-in-out infinite; }
  .shimmer-box { background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%); background-size: 400px 100%; animation: shimmer 1.2s infinite; border-radius: 12px; }
  .tip-item { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .tip-item:hover { transform: translateX(6px); box-shadow: -3px 0 12px rgba(0,0,0,0.3); }
`;

function SkeletonLoader() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[1, 2].map(i => (
                <div key={i} className="card" style={{ opacity: 0.6 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
                        <div className="shimmer-box" style={{ width: 48, height: 48, borderRadius: 14 }} />
                        <div style={{ flex: 1 }}>
                            <div className="shimmer-box" style={{ height: 18, width: "40%", marginBottom: 8 }} />
                            <div className="shimmer-box" style={{ height: 12, width: "25%" }} />
                        </div>
                    </div>
                    <div className="shimmer-box" style={{ height: 80, marginBottom: 16 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[1,2,3].map(j => <div key={j} className="shimmer-box" style={{ height: 48 }} />)}
                    </div>
                </div>
            ))}
        </div>
    );
}

function AIWaitingLoader() {
    return (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🤖</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900, margin: "0 0 12px", color: "var(--electric)" }}>
                AI IS ANALYZING...
            </div>
            <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>
                Gemini AI is generating your personalized recommendations. Please wait...
            </div>
            <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--electric)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 24px" }} />
            <div style={{ display: "inline-flex", gap: 8, background: "var(--surface2)", borderRadius: 12, padding: "12px 20px", fontSize: 13, color: "var(--muted)" }}>
                <span>💪</span> Logged → <span>🤖</span> Analyzing → <span>⚡</span> Almost ready...
            </div>
        </div>
    );
}

function ScoreRing({ score, label, color }) {
    const r = 28, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ;
    return (
        <div style={{ textAlign: "center" }}>
            <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a1a" strokeWidth="6" />
                <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
                        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s ease" }} />
            </svg>
            <div style={{ marginTop: -52, fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color }}>{score}</div>
            <div style={{ marginTop: 32, fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
        </div>
    );
}

function TipSection({ title, icon, tips, bgColor, borderColor, numColor }) {
    return (
        <div style={{ background: bgColor, borderRadius: 16, padding: 20, border: `1px solid ${borderColor}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${numColor}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
                <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5, color: numColor, fontWeight: 800 }}>{title}</div>
                <div style={{ marginLeft: "auto", background: `${numColor}22`, color: numColor, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{tips.length} tips</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tips.map((tip, j) => (
                    <div key={j} className="tip-item rec-item-anim"
                         style={{ display: "flex", gap: 14, alignItems: "flex-start", background: `${numColor}11`, borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${numColor}`, animationDelay: `${j * 0.06}s` }}>
                        <div style={{ background: numColor, color: "#000", borderRadius: 8, minWidth: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{j + 1}</div>
                        <div style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text)", letterSpacing: 0.2 }}>{tip}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RecCard({ rec, index }) {
    const [expanded, setExpanded] = useState(index === 0);



    const date = rec.createdAt ? new Date(rec.createdAt).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    }) : "";

    const ACTIVITY_ICONS = {
        RUNNING: "🏃", WALKING: "🚶", CYCLING: "🚴", SWIMMING: "🏊",
        WEIGHT_TRAINING: "🏋️", YOGA: "🧘", HIIT: "🔥", PILATES: "🤸", OTHER: "⚡",
    };

    return (
        <div className="card rec-card-anim ai-glow"
             style={{ animationDelay: `${index * 0.1}s`, border: "1px solid rgba(0,194,255,0.15)" }}>

            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: expanded ? 20 : 0 }}
                 onClick={() => setExpanded(e => !e)}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #00C2FF22, #00C2FF44)", border: "1px solid rgba(0,194,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                        {ACTIVITY_ICONS[rec.activityType] || "🤖"}
                    </div>
                    <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
                            {rec.activityType?.replace(/_/g, " ") || "AI"} INSIGHT #{index + 1}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{date}</div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(212,255,0,0.1)", color: "var(--neon)", fontSize: 11, fontWeight: 700 }}>GEMINI AI</div>
                    <div style={{ color: "var(--muted)", fontSize: 18, transition: "transform 0.3s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</div>
                </div>
            </div>

            {expanded && (
                <>


                    {/* AI ANALYSIS */}
                    {rec.recommendations && (
                        <div style={{ background: "linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,194,255,0.02))", borderRadius: 16, padding: 20, marginBottom: 20, borderLeft: "3px solid var(--electric)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: -10, right: -10, fontSize: 80, opacity: 0.03 }}>🤖</div>
                            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "var(--electric)", marginBottom: 10, fontWeight: 700 }}>📋 AI ANALYSIS</div>
                            <div style={{ fontSize: 14, lineHeight: 1.85, color: "var(--text)" }}>{rec.recommendations}</div>
                        </div>
                    )}

                    {/* TIPS */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {rec.improvements?.length > 0 && (
                            <TipSection title="Improvements" icon="💪" tips={rec.improvements}
                                        bgColor="rgba(255,77,0,0.05)" borderColor="rgba(255,77,0,0.2)" numColor="#FF4D00" />
                        )}
                        {rec.suggestions?.length > 0 && (
                            <TipSection title="Suggestions" icon="💡" tips={rec.suggestions}
                                        bgColor="rgba(0,194,255,0.05)" borderColor="rgba(0,194,255,0.2)" numColor="#00C2FF" />
                        )}
                        {rec.safety?.length > 0 && (
                            <TipSection title="Safety Tips" icon="🛡️" tips={rec.safety}
                                        bgColor="rgba(212,255,0,0.05)" borderColor="rgba(212,255,0,0.2)" numColor="#D4FF00" />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default function Recommendations({ user }) {
    const [recs, setRecs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [waiting, setWaiting] = useState(false);

    useEffect(() => {
        const userId = keycloak.tokenParsed?.sub;
        if (!userId) return;

        let attempts = 0;
        const maxAttempts = 15;
        let timeoutId;

        const fetchRecs = () => {
            getUserRecommendations(userId)
                .then(data => {
                    if (data && data.length > 0) {
                        setRecs(data);
                        setLoading(false);
                        setWaiting(false);
                    } else if (attempts < maxAttempts) {
                        attempts++;
                        setLoading(false);
                        setWaiting(true);
                        timeoutId = setTimeout(fetchRecs, 3000);
                    } else {
                        setLoading(false);
                        setWaiting(false);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                    setWaiting(false);
                });
        };

        fetchRecs();
        return () => clearTimeout(timeoutId);
    }, []);

    const totalItems = recs.reduce((s, r) => s + (r.improvements?.length || 0) + (r.suggestions?.length || 0) + (r.safety?.length || 0), 0);

    return (
        <>
            <style>{css}</style>
            <div className="topbar">
                <div>
                    <div className="topbar-title">AI INSIGHTS</div>
                    <div className="topbar-sub">Powered by Gemini AI • {recs.length} analyses • {totalItems} total tips</div>
                </div>
                <div style={{ background: "linear-gradient(135deg, rgba(0,194,255,0.1), rgba(212,255,0,0.1))", border: "1px solid rgba(0,194,255,0.2)", borderRadius: 16, padding: "12px 20px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900, color: "var(--electric)", lineHeight: 1 }}>{recs.length}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>Analyses</div>
                </div>
            </div>

            {!loading && !waiting && recs.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
                    {[
                        { icon: "💪", label: "Improvement Tips", val: recs.reduce((s, r) => s + (r.improvements?.length || 0), 0), color: "var(--fire)" },
                        { icon: "💡", label: "Suggestions", val: recs.reduce((s, r) => s + (r.suggestions?.length || 0), 0), color: "var(--electric)" },
                        { icon: "🛡️", label: "Safety Tips", val: recs.reduce((s, r) => s + (r.safety?.length || 0), 0), color: "var(--neon)" },
                    ].map(({ icon, label, val, color }) => (
                        <div key={label} className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
                            <div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loading ? <SkeletonLoader />
                : waiting ? <AIWaitingLoader />
                    : recs.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: 60 }}>
                            <div style={{ fontSize: 64, marginBottom: 16 }}>🤖</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900, margin: "0 0 12px" }}>NO INSIGHTS YET</div>
                            <div style={{ color: "var(--muted)", fontSize: 14, maxWidth: 400, margin: "0 auto 24px" }}>Log your first workout and Gemini AI will generate personalized recommendations!</div>
                            <div style={{ display: "inline-flex", gap: 8, background: "var(--surface2)", borderRadius: 12, padding: "12px 20px", fontSize: 13, color: "var(--muted)" }}>
                                <span>💪</span> Log workout → <span>🤖</span> AI analyzes → <span>⚡</span> Get insights
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {recs.map((rec, i) => <RecCard key={rec.id || i} rec={rec} index={i} />)}
                        </div>
                    )}
        </>
    );
}