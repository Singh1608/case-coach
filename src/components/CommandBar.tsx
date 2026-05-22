const COMMANDS: [string, string][] = [
  ["/hint", "Get a nudge without the answer"],
  ["/feedback", "Pause for structured feedback"],
  ["/score", "Score across 5 MBB dimensions"],
  ["Enter", "Send your response"],
];

export default function CommandBar() {
  return (
    <div
      style={{
        marginTop: "48px",
        padding: "20px",
        border: "1px solid #1a1a2e",
        borderRadius: "2px",
        background: "#0c0c18",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.15em",
          color: "#4f46e5",
          marginBottom: "8px",
          textTransform: "uppercase",
        }}
      >
        Commands
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {COMMANDS.map(([cmd, desc]) => (
          <div key={cmd} style={{ fontSize: "11px", color: "#334155" }}>
            <span style={{ color: "#a5b4fc" }}>{cmd}</span> -- {desc}
          </div>
        ))}
      </div>
    </div>
  );
}
