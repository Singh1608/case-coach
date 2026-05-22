const MODEL = "gemini-1.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type Message = { role: "user" | "assistant"; content: string };

type Payload = {
  system: string;
  messages: Message[];
};

export async function callAnthropic(payload: Payload): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? "";

  // Gemini uses "model" instead of "assistant"
  const contents = payload.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(`${API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: payload.system }] },
      contents,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
    }),
  });

  const raw = await res.text();
  if (!raw?.trim()) throw new Error("Empty response (status " + res.status + ")");
  if (!res.ok) throw new Error("API " + res.status + ": " + raw.slice(0, 200));
  const data = JSON.parse(raw);
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "...";
}
