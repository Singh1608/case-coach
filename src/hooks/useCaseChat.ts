import { useState } from "react";
import type { Case } from "../data/cases";
import { SYSTEM_PROMPT } from "../prompts/systemPrompt";
import { callAnthropic } from "../lib/anthropic";

export type Message = { role: "user" | "assistant"; content: string };

const MODEL = "claude-sonnet-4-5";

export function useCaseChat() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const startCase = async (c: Case): Promise<string> => {
    setSelectedCase(c);
    setMessages([]);
    setLoading(true);
    let text = "";
    try {
      text = await callAnthropic({
        model: MODEL,
        max_tokens: 1000,
        system: SYSTEM_PROMPT(c, c.style),
        messages: [{ role: "user", content: "Please begin the case interview." }],
      });
      setMessages([{ role: "assistant", content: text }]);
    } catch (err) {
      const msg = "Error: " + (err instanceof Error ? err.message : String(err));
      setMessages([{ role: "assistant", content: msg }]);
    }
    setLoading(false);
    return text;
  };

  const sendMessage = async (userMsg: string): Promise<string> => {
    if (!userMsg.trim() || loading || !selectedCase) return "";
    const updated: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(updated);
    setLoading(true);
    let text = "";
    try {
      text = await callAnthropic({
        model: MODEL,
        max_tokens: 1000,
        system: SYSTEM_PROMPT(selectedCase, selectedCase.style),
        messages: updated,
      });
      setMessages([...updated, { role: "assistant", content: text }]);
    } catch (err) {
      const msg = "Error: " + (err instanceof Error ? err.message : String(err));
      setMessages([...updated, { role: "assistant", content: msg }]);
    }
    setLoading(false);
    return text;
  };

  const resetCase = () => {
    setSelectedCase(null);
    setMessages([]);
  };

  return { selectedCase, messages, loading, startCase, sendMessage, resetCase };
}
