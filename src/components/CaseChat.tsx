import { useState, useRef, useEffect, useCallback } from "react";
import type { Case } from "../data/cases";
import type { Message } from "../hooks/useCaseChat";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useVoiceOutput } from "../hooks/useVoiceOutput";
import MessageBubble from "./MessageBubble";

type Props = {
  selectedCase: Case | null;
  messages: Message[];
  loading: boolean;
  onSendMessage: (msg: string) => Promise<string>;
  onBack: () => void;
};

export default function CaseChat({
  selectedCase,
  messages,
  loading,
  onSendMessage,
  onBack,
}: Props) {
  const [input, setInput] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { isSpeaking, speak, stop: stopSpeaking } = useVoiceOutput(voiceEnabled);

  const handleTranscript = useCallback((text: string) => setInput(text), []);
  const { isListening, transcript, start: startListening, stop: stopListening } =
    useVoiceInput(handleTranscript);

  // Speak new AI messages
  const lastAIContent = messages.at(-1)?.role === "assistant" ? messages.at(-1)!.content : null;
  const spokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastAIContent && lastAIContent !== spokenRef.current) {
      spokenRef.current = lastAIContent;
      speak(lastAIContent);
    }
  }, [lastAIContent, speak]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (override?: string) => {
    const msg = (override ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    await onSendMessage(msg);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening();
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #0f0c29 0%, #1a1a2e 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        color: "#f1f5f9",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .bubble-ai { background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); border-radius: 18px 18px 18px 4px; }
        .bubble-user { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px 18px 4px 18px; }
        .icon-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-size: 18px; flex-shrink: 0; }
        .icon-btn:hover { background: rgba(255,255,255,0.15); }
        .icon-btn.active { background: rgba(239,68,68,0.3); border-color: #ef4444; animation: pulse-ring 1s ease infinite; }
        .icon-btn.speaking { background: rgba(99,102,241,0.3); border-color: #6366f1; }
        .send-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 12px; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; font-size: 18px; flex-shrink: 0; }
        .send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 16px rgba(99,102,241,0.4); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        textarea { background: transparent; border: none; outline: none; color: #f1f5f9; font-family: inherit; font-size: 14px; resize: none; flex: 1; line-height: 1.6; }
        textarea::placeholder { color: rgba(255,255,255,0.25); }
        @keyframes pulse-ring { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); } }
        @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        .dot { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; animation: bounce 1.2s ease infinite; display: inline-block; }
        .dot:nth-child(2) { animation-delay: 0.15s; }
        .dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(15,12,41,0.8)",
          backdropFilter: "blur(12px)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => { stopSpeaking(); onBack(); }}
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "7px 14px",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "inherit",
          }}
        >
          ← Cases
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {selectedCase?.title}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            {selectedCase?.type} · {selectedCase?.style} · {selectedCase?.difficulty}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isSpeaking && (
            <button className="icon-btn speaking" onClick={stopSpeaking} title="Stop speaking">
              🔊
            </button>
          )}
          <button
            className="icon-btn"
            onClick={() => { setVoiceEnabled((v) => !v); if (isSpeaking) stopSpeaking(); }}
            title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
            style={{ opacity: voiceEnabled ? 1 : 0.4 }}
          >
            {voiceEnabled ? "🔈" : "🔇"}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              🎓
            </div>
            <div
              className="bubble-ai"
              style={{ padding: "14px 18px", display: "flex", gap: 5, alignItems: "center" }}
            >
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "12px 16px 16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15,12,41,0.9)",
          backdropFilter: "blur(12px)",
          flexShrink: 0,
        }}
      >
        {(isListening || transcript) && (
          <div
            style={{
              marginBottom: 8,
              padding: "8px 14px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10,
              fontSize: 13,
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#ef4444",
                display: "inline-block",
                animation: "pulse-ring 1s ease infinite",
              }}
            />
            {transcript || "Listening..."}
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "10px 12px",
          }}
        >
          <textarea
            ref={inputRef}
            rows={2}
            placeholder="Type your response or use the mic..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button
            className={`icon-btn ${isListening ? "active" : ""}`}
            onClick={handleMicClick}
            disabled={loading}
            title={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? "⏹" : "🎙️"}
          </button>
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            ↑
          </button>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 8,
            justifyContent: "center",
          }}
        >
          {(["/hint", "/feedback", "/score"] as const).map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleSend(cmd)}
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 8,
                padding: "4px 12px",
                color: "#a5b4fc",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
