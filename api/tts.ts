export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body ?? {};
  if (!text || typeof text !== "string" || text.length > 5000) {
    return res.status(400).json({ error: "Invalid text" });
  }

  const apiKey = process.env.GOOGLE_TTS_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "TTS not configured" });
  }

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: "en-GB", name: "en-GB-Neural2-B" },
          audioConfig: { audioEncoding: "MP3", speakingRate: 0.95, pitch: 0 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Google TTS error:", response.status, errText);
      return res.status(502).json({ error: "TTS service error" });
    }

    const data = await response.json();
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ audioContent: data.audioContent });
  } catch (err) {
    console.error("TTS handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
