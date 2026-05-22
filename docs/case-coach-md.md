# Case Coach — Project Documentation

## Project Overview

**Case Coach** is a voice-enabled, AI-powered management consulting case interview simulator built as a single React artifact running inside Claude.ai. It simulates live MBB-style (McKinsey, BCG, Bain) case interviews using the Anthropic API directly from the browser.

The app has 25 hand-crafted cases across 8 case types, three difficulty levels, and three interview styles. The AI interviewer persona adapts its behaviour based on the style of the selected case. Voice input (Web Speech API) and voice output (SpeechSynthesis API) are both supported.

---

## Current State (as built in Claude.ai artifact)

### Tech Stack
- **Framework:** React (functional components, hooks) — loaded via Claude.ai artifact runtime
- **Styling:** Inline CSS + injected `<style>` blocks (no Tailwind, no external CSS files — artifact constraint)
- **AI:** Anthropic Messages API (`claude-sonnet-4-5`) called directly from the browser via `fetch`
- **Voice Input:** Web Speech API (`window.SpeechRecognition` / `window.webkitSpeechRecognition`)
- **Voice Output:** Web Speech Synthesis API (`window.speechSynthesis`)
- **State:** React `useState` / `useRef` — all in-memory, no persistence
- **No routing, no build system, no external dependencies** beyond what Claude.ai artifact runtime provides

### API Call Pattern
```javascript
fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"  // required for browser-direct calls
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-5",
    max_tokens: 1000,
    system: SYSTEM_PROMPT(caseData, caseData.style),
    messages: conversationHistory   // full history passed each turn (no server-side memory)
  })
})
```
The API key is injected by the Claude.ai platform — it is **not** present in the code.

---

## Application Architecture

### Two-Screen Structure

#### Screen 1: Case Selection (`phase === "select"`)
- Filter bar across 8 case types + "All"
- 25 case cards rendered as a vertical list
- Each card shows: type badge (colour-coded), difficulty badge, interview style label, title, truncated prompt
- Clicking a card immediately calls `startCase(c)` which fires the first API call and transitions to the chat screen

#### Screen 2: Chat Interface (`phase === "chat"`)
- Fixed header: back button, case title/metadata, voice toggle, stop-speaking button
- Scrollable message thread: alternating AI (left) and user (right) bubbles
- Typing indicator (three bouncing dots) while API call is in flight
- Input area: textarea + mic button + send button
- Three quick-command buttons: `/hint`, `/feedback`, `/score`

---

## Data Model

### Case Object Shape
```javascript
{
  id: Number,           // 1–25
  type: String,         // one of 8 case types (see below)
  title: String,        // display name
  difficulty: String,   // "Easy" | "Medium" | "Hard"
  style: String,        // "Candidate-led" | "Interviewer-led" | "Mix"
  prompt: String,       // opening prompt delivered by interviewer
  context: String       // background data shared ONLY when candidate asks well-framed questions
}
```

### Message Object Shape (conversation history)
```javascript
{ role: "user" | "assistant", content: String }
```
Full history is passed to the API on every turn — the model has no memory between calls.

---

## Case Library (25 Cases)

### Case Types and Colour Codes
| Type | Hex | Count |
|---|---|---|
| Market Entry | `#6366f1` | 4 |
| Profitability | `#f59e0b` | 5 |
| M&A / Due Diligence | `#ec4899` | 2 |
| Operations / Cost Reduction | `#10b981` | 3 |
| Go to Market | `#3b82f6` | 4 |
| Product Strategy | `#8b5cf6` | 2 |
| Product Analysis | `#ef4444` | 2 |
| Channel Analysis | `#14b8a6` | 2 |
| *(cross-listed)* | — | 1 (Operations/Profitability overlap) |

### Full Case List

| ID | Type | Title | Difficulty | Style |
|---|---|---|---|---|
| 1 | Market Entry | Coffee Chain Expansion into India | Medium | Candidate-led |
| 2 | Market Entry | US Pharma Enters GCC | Hard | Interviewer-led |
| 3 | Market Entry | Asian Clothing Retailer Struggling in the US | Medium | Mix |
| 4 | Profitability | Declining Margins at Auto Manufacturer | Hard | Interviewer-led |
| 5 | Profitability | Struggling Luxury Hotel Chain in SE Asia | Medium | Mix |
| 6 | Profitability | Indian Cab Aggregator Profit Slowdown | Medium | Candidate-led |
| 7 | M&A / Due Diligence | PE Acquisition of HR SaaS | Hard | Candidate-led |
| 8 | M&A / Due Diligence | PE Investment in Sauce Manufacturer | Hard | Interviewer-led |
| 9 | Operations / Cost Reduction | Hospital Supply Chain Overhaul (UAE) | Medium | Interviewer-led |
| 10 | Operations / Cost Reduction | E-Commerce Fulfillment Bottleneck | Hard | Candidate-led |
| 11 | Go to Market | B2B Fintech GTM Launch | Medium | Candidate-led |
| 12 | Go to Market | Consumer Fitness App Expanding to LATAM | Medium | Interviewer-led |
| 13 | Product Strategy | Ride-Hailing Super App Pivot | Hard | Mix |
| 14 | Product Strategy | Netflix India Revenue Growth | Hard | Candidate-led |
| 15 | Product Analysis | Declining DAU on Social Platform | Hard | Interviewer-led |
| 16 | Product Analysis | SaaS Trial-to-Paid Conversion Drop | Medium | Mix |
| 17 | Channel Analysis | CPG Brand: Retail vs. Direct-to-Consumer | Medium | Candidate-led |
| 18 | Channel Analysis | Distributor vs. Direct Sales Force | Hard | Interviewer-led |
| 19 | Profitability | Sugar Mill Cost Spike | Easy | Interviewer-led |
| 20 | Profitability | Airport Eatery Revenue Growth | Easy | Mix |
| 21 | Market Entry | Indian 2-Wheeler Brand Goes Global | Easy | Candidate-led |
| 22 | Go to Market | BHIM UPI 2.0 Market Share Push | Easy | Interviewer-led |
| 23 | Operations / Cost Reduction | Equipment Manufacturer Price Increase Decision | Easy | Mix |
| 24 | Profitability | Western Dessert Manufacturer Profit Decline | Easy | Interviewer-led |
| 25 | Go to Market | Pharma Company Losing Ground to Competitor | Easy | Candidate-led |

---

## AI Interviewer System Prompt Logic

The system prompt is generated dynamically per case via `SYSTEM_PROMPT(caseData, style)`. Key elements:

### Persona
- Expert MBB interviewer — warm but rigorous
- Responses capped at 1–3 sentences
- One question at a time
- Never volunteers data unprompted — data is shared only when the candidate asks a well-framed question
- Acknowledges sharp moves briefly ("Good instinct." / "Sharp.") then moves on
- Avoids markdown/bullets in responses (optimised for text-to-speech)

### Style Variants
```
Interviewer-led (McKinsey):
  Ask one targeted question at a time. Control the agenda. Push for quant.

Candidate-led (BCG/Bain):
  Let candidate drive. Wait for structure. Provide data only on direct request.

Mix:
  Start candidate-led. Shift to interviewer-led if candidate stalls or drifts.
```

### Silent Evaluation Dimensions (surfaced only on command)
1. Structure & MECE thinking
2. Hypothesis-driven approach
3. Quantitative comfort
4. Communication clarity
5. Insight & recommendation quality

### In-Session Commands
| Command | Behaviour |
|---|---|
| `/hint` | Subtle nudge toward a productive direction |
| `/feedback` | Structured feedback across all 5 evaluation dimensions |
| `/score` | Numerical score 1–10 per dimension with justification |

---

## Voice System

### Voice Input
- Uses `window.SpeechRecognition` / `window.webkitSpeechRecognition`
- `continuous: false`, `interimResults: true`, `lang: "en-US"`
- Interim transcript shown in a red live-preview bar above the input
- Final transcript populates the textarea on `isFinal`
- Mic button animates with pulsing red ring while active
- Speaking is stopped before mic activates (prevents feedback loop)

### Voice Output
- Uses `window.speechSynthesis`
- Cleans AI response of markdown (`*`, `_`, `` ` ``, `#`) and commands before speaking
- Prefers voices in order: "Google UK English Male" → "Daniel" → "Alex" → any `en-GB`
- `rate: 0.95`, `pitch: 1.0`, `volume: 1`
- `isSpeaking` state tracked via `onstart`/`onend`/`onerror` handlers
- Stop button appears in header when speaking
- Voice output can be toggled on/off with speaker icon (persists to `voiceEnabled` state)
- `synthRef` holds `window.speechSynthesis` reference

---

## UI / Visual Design

### Design Language
- Dark glassmorphism: deep indigo/purple gradients (`#0f0c29`, `#302b63`, `#24243e`)
- Cards: `rgba(255,255,255,0.05)` with `backdrop-filter: blur(12px)`, subtle white border
- Type badges: each type has its own accent colour with 25% opacity background
- Difficulty badges: green (Easy), amber (Medium), red (Hard)
- Primary accent: `#6366f1` (indigo) and `#8b5cf6` (purple) gradient
- All text: white-based with opacity variations (`rgba(255,255,255,0.4–1.0)`)

### Layout
- Select screen: centered column, max-width 860px, scrollable
- Chat screen: full viewport height, flex column — header fixed, messages scrollable, input fixed at bottom
- Message bubbles: AI on left (indigo tint), user on right (white tint)
- AI avatar: 🎓 with indigo gradient background; User avatar: 👤

---

## State Variables

```javascript
selectedCase     // Object | null — currently active case
messages         // Array<{role, content}> — full conversation history
input            // String — current textarea value
loading          // Boolean — API call in flight
phase            // "select" | "chat"
filter           // String — active type filter on select screen
isListening      // Boolean — mic active
isSpeaking       // Boolean — TTS active
voiceEnabled     // Boolean — TTS on/off toggle
transcript       // String — interim speech recognition result
```

---

## Known Constraints (from Claude.ai artifact environment)

1. **No localStorage / sessionStorage** — all state is in-memory, lost on refresh
2. **No file system access**
3. **No npm packages** beyond what the artifact runtime pre-loads
4. **No `<form>` tags** — all interactions via `onClick`/`onChange`
5. **No routing** — phase variable handles screen transitions
6. **API key injected by platform** — not in code
7. **Single file** — entire app is one React component export
8. **External scripts** only from `cdnjs.cloudflare.com`

---

## Intended Next Steps (for Claude Code continuation)

When moving this project to Claude Code, the following upgrades are natural:

### Infrastructure
- [ ] Move to a proper React + Vite project structure
- [ ] Add environment variable handling for `ANTHROPIC_API_KEY` (via `.env`)
- [ ] Move API calls to a backend (Next.js API route or Express) to avoid exposing key client-side
- [ ] Add proper routing (React Router or Next.js pages)

### Persistence
- [ ] User accounts or local profiles (localStorage or DB)
- [ ] Session history — save past attempts per case
- [ ] Progress tracking — which cases attempted, scores over time

### Features
- [ ] Timer per case session (typical case = 20–25 min)
- [ ] Case bookmarking / favourites
- [ ] Math scratchpad / calculation helper (whiteboard-style)
- [ ] Exhibit upload — upload a chart/table as part of the case prompt
- [ ] Post-session summary PDF export
- [ ] Structured feedback report saved per session
- [ ] Leaderboard or self-comparison scoring trends

### Content
- [ ] More cases (target 50+)
- [ ] Custom case builder (user-defined prompt + context)
- [ ] Case difficulty calibration based on user performance history

### Voice
- [ ] Upgrade to ElevenLabs or Cartesia for higher-quality TTS
- [ ] Push-to-talk vs. always-on toggle
- [ ] Silence detection for auto-submit

### UX
- [ ] Onboarding flow / tutorial case
- [ ] Case difficulty recommendation based on prior scores
- [ ] Mobile-optimised layout
- [ ] Dark/light mode toggle

---

## File Structure (recommended for Claude Code)

```
case-coach/
├── .env                          # ANTHROPIC_API_KEY
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx                   # Router + layout shell
│   ├── data/
│   │   └── cases.ts              # All 25 case objects (extracted from CASES array)
│   ├── components/
│   │   ├── CaseSelect.tsx        # Select screen
│   │   ├── CaseChat.tsx          # Chat screen
│   │   ├── MessageBubble.tsx     # Single message display
│   │   ├── VoiceInput.tsx        # Mic button + transcript preview
│   │   └── CommandBar.tsx        # /hint /feedback /score buttons
│   ├── hooks/
│   │   ├── useVoiceInput.ts      # SpeechRecognition logic
│   │   ├── useVoiceOutput.ts     # SpeechSynthesis logic
│   │   └── useCaseChat.ts        # API call logic + message state
│   ├── lib/
│   │   └── anthropic.ts          # API call wrapper (or proxy to backend)
│   ├── prompts/
│   │   └── systemPrompt.ts       # SYSTEM_PROMPT generator function
│   └── styles/
│       └── globals.css
```

---

## Source Reference

The complete working source code exists as a React artifact in the Claude.ai conversation. The artifact ID is `remixed-05b6ff9c`. All 25 cases with full context strings, the complete system prompt generator, voice logic, and UI are contained in that single component (~500 lines).
