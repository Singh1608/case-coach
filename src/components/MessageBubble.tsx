import type { Message } from "../hooks/useCaseChat";

type Props = { message: Message };

export default function MessageBubble({ message }: Props) {
  const isAI = message.role === "assistant";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isAI ? "row" : "row-reverse",
        gap: 10,
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: isAI
            ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
            : "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {isAI ? "🎓" : "👤"}
      </div>
      <div
        className={isAI ? "bubble-ai" : "bubble-user"}
        style={{ maxWidth: "78%", padding: "12px 16px" }}
      >
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: isAI ? "#e2e8f0" : "rgba(255,255,255,0.75)",
            whiteSpace: "pre-wrap",
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
