const MODEL = "llama-3.3-70b-versatile";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

type Message = { role: "user" | "assistant"; content: string };

type Payload = {
  system: string;
  messages: Message[];
};

export async function callAnthropic(payload: Payload): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: payload.system },
        ...payload.messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  const raw = await res.text();
  if (!raw?.trim()) throw new Error("Empty response (status " + res.status + ")");
  if (!res.ok) throw new Error("API " + res.status + ": " + raw.slice(0, 200));
  const data = JSON.parse(raw);
  return data.choices?.[0]?.message?.content ?? "...";
}
