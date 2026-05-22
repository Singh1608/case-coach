import type { Case } from "../data/cases";
import { TYPE_COLORS, CASE_TYPES } from "../data/cases";

type Props = {
  filter: string;
  setFilter: (f: string) => void;
  cases: Case[];
  onSelectCase: (c: Case) => void;
};

export default function CaseSelect({ filter, setFilter, cases, onSelectCase }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        .card { background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px 24px; cursor: pointer; transition: all 0.25s ease; }
        .card:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.2); }
        .pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; }
        .filter-btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.6); padding: 7px 16px; font-size: 12px; cursor: pointer; border-radius: 20px; transition: all 0.15s; white-space: nowrap; font-family: inherit; }
        .filter-btn.active, .filter-btn:hover { background: rgba(99,102,241,0.3); border-color: #6366f1; color: #fff; }
        .diff-easy { background: rgba(16,185,129,0.15); color: #34d399; }
        .diff-medium { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .diff-hard { background: rgba(239,68,68,0.15); color: #f87171; }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 20px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: 24,
              padding: "8px 20px",
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 18 }}>🎯</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "#a5b4fc",
                textTransform: "uppercase",
              }}
            >
              MBB Case Interview Coach
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(36px,6vw,60px)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 16,
              background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            The Case Coach
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 15,
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            25 cases across 8 types. Voice-enabled. Type{" "}
            <span style={{ color: "#a5b4fc", fontWeight: 600 }}>/hint</span>,{" "}
            <span style={{ color: "#a5b4fc", fontWeight: 600 }}>/feedback</span>, or{" "}
            <span style={{ color: "#a5b4fc", fontWeight: 600 }}>/score</span> anytime.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            {(
              [
                ["25", "Cases"],
                ["8", "Types"],
                ["🎙️", "Voice I/O"],
                ["3", "Difficulty Levels"],
              ] as const
            ).map(([n, l]) => (
              <div
                key={l}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "10px 20px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, color: "#a5b4fc" }}>{n}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 28,
            justifyContent: "center",
          }}
        >
          {CASE_TYPES.map((t) => (
            <button
              key={t}
              className={`filter-btn ${filter === t ? "active" : ""}`}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Case cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cases.map((c) => (
            <div key={c.id} className="card" onClick={() => onSelectCase(c)}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 10,
                      alignItems: "center",
                    }}
                  >
                    <span
                      className="pill"
                      style={{
                        background: TYPE_COLORS[c.type] + "25",
                        color: TYPE_COLORS[c.type],
                        border: `1px solid ${TYPE_COLORS[c.type]}40`,
                      }}
                    >
                      {c.type}
                    </span>
                    <span className={`pill diff-${c.difficulty.toLowerCase()}`}>
                      {c.difficulty}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>
                      {c.style}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#f1f5f9",
                      marginBottom: 6,
                    }}
                  >
                    {c.title}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                    {c.prompt.slice(0, 110)}...
                  </div>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(99,102,241,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 16,
                  }}
                >
                  →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
