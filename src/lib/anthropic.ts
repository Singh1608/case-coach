const API_URL = "https://api.anthropic.com/v1/messages";

type Message = { role: string; content: string };

type AnthropicPayload = {
  model: string;
  max_tokens: number;
  system: string;
  messages: Message[];
};

export async function callAnthropic(payload: AnthropicPayload): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(payload),
  });
  const raw = await res.text();
  if (!raw?.trim()) throw new Error("Empty response (status " + res.status + ")");
  if (!res.ok) throw new Error("API " + res.status + ": " + raw.slice(0, 200));
  const data = JSON.parse(raw);
  return data.content?.find((b: { type: string; text: string }) => b.type === "text")?.text ?? "...";
}
