import { useCallback, useRef, useState } from "react";

export function useVoiceOutput(enabled: boolean) {
  const synthRef = useRef(window.speechSynthesis);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || !synthRef.current) return;
      synthRef.current.cancel();
      const clean = text.replace(/[*_`#]/g, "").replace(/\/\w+/g, "");
      const utt = new SpeechSynthesisUtterance(clean);
      utt.rate = 0.95;
      utt.pitch = 1.0;
      utt.volume = 1;
      const voices = synthRef.current.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes("Google UK English Male") ||
          v.name.includes("Daniel") ||
          v.name.includes("Alex") ||
          v.lang.includes("en-GB")
      );
      if (preferred) utt.voice = preferred;
      utt.onstart = () => setIsSpeaking(true);
      utt.onend = () => setIsSpeaking(false);
      utt.onerror = () => setIsSpeaking(false);
      synthRef.current.speak(utt);
    },
    [enabled]
  );

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
}
