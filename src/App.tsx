import { useState, useRef, useEffect, useCallback } from "react";

const MODEL_ORDER: Record<string, string[]> = {
  Hard:   ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-2.5-flash-lite"],
  Medium: ["gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-flash-lite"],
  Easy:   ["gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-flash-lite"],
};

const CASES = [
  { id: 1, type: "Market Entry", title: "Coffee Chain Expansion into India", difficulty: "Medium", style: "Candidate-led", prompt: "Your client is a premium European coffee chain with 200 locations. They are considering entering the Indian market. How would you approach this?", context: "Client has 500M EUR revenue, strong brand in France/Germany, no prior Asia presence. Average ticket EUR 6 in Europe. India specialty coffee market estimated at USD 200M, growing 25% YoY. Target cities: Mumbai, Delhi, Bengaluru (combined urban population ~60M). Estimated addressable customers: 8M urban professionals. Breakeven per store: ~150 covers/day at INR 350 average ticket. Store setup cost: ~INR 1.2 Cr. India has fast-growing urban middle class but tea dominates beverage culture (85% of hot beverage consumption)." },
  { id: 2, type: "Market Entry", title: "US Pharma Enters GCC", difficulty: "Hard", style: "Interviewer-led", prompt: "A large US pharmaceutical company is evaluating whether to enter the Gulf Cooperation Council market with its flagship diabetes drug. Should they enter, and if so, how?", context: "Drug is a top-3 seller in the US with $1.2B annual revenue. GCC has highest diabetes prevalence globally (~20% of adults, ~6M diabetic patients across 6 countries). GCC diabetes drug market estimated at $1.4B, growing 12% YoY. Client's drug priced at ~$800/month per patient in the US; GCC reimbursement rates typically 60–70% of US price. Regulatory approval: Saudi FDA 18–24 months, UAE 12–18 months. Market dominated by Novo Nordisk (35% share) and Sanofi (28% share). Distribution through government hospital formularies (70% of sales) and private pharmacy chains (30%). Client has no current Middle East presence." },
  { id: 3, type: "Market Entry", title: "Asian Clothing Retailer Struggling in the US", difficulty: "Medium", style: "Mix", prompt: "Our client, Unicloth, is an Asian clothing retailer that entered the United States five years ago. Despite strong brand recognition at home, they have been unable to turn a profit. The CEO has engaged us to find out why and recommend next steps.", context: "4 stores total: 3 mall stores plus a flagship on 5th Avenue. Average product price ~$40, in line with mid-tier US competitors. Manufactured in China and Bangladesh. Revenue approx $125M but costs are higher. Mall store revenue ~$28M each; flagship ~$41M. COGS ~55% of revenue. SG&A ~$35M/year. Rent: flagship $18M/year, mall stores $6M each/year. Logistics and import duties add ~8% to COGS vs. domestic competitors." },
  { id: 4, type: "Profitability", title: "Declining Margins at Auto Manufacturer", difficulty: "Hard", style: "Interviewer-led", prompt: "Our client is a mid-size automotive manufacturer. Profits have declined 40% over the past 3 years despite revenue holding steady. The CEO has hired us to diagnose the problem and recommend actions.", context: "Client operates in Germany with global sales. Revenue ~2B EUR. EBIT margin was 12% (EUR 240M), now 7% (EUR 140M) — absolute profit drop of EUR 100M. Competitors margins held at ~11%. Three product lines: mass-market sedans (50% of revenue, margin 10%), SUVs (35% of revenue, margin 14%), EV range launched 2 years ago (15% of revenue, margin -8%). EV line losing ~EUR 24M/year. Battery costs EUR 180/kWh vs. industry benchmark of EUR 130/kWh. Warranty claims up 18% on EV range vs. 3% on legacy lines." },
  { id: 5, type: "Profitability", title: "Struggling Luxury Hotel Chain in SE Asia", difficulty: "Medium", style: "Mix", prompt: "A luxury hotel chain operating across Southeast Asia has seen its EBITDA drop from 22% to 11% in 18 months. Leadership is alarmed. Where do you start?", context: "Chain operates 14 properties, ~3,200 rooms total (~230 rooms/property avg). Average daily rate (ADR): USD 320 (was USD 350). Occupancy: was 79%, now 68%. RevPAR: was USD 276, now USD 218 (down 21%). Total revenue ~USD 380M. F&B revenue down 18%, spa revenue down 22%. Fixed costs: ~65% of total cost base. Labour costs up 12% YoY due to talent shortages post-COVID. Corporate bookings: 28% of volume (was 41%). Leisure travel rebounded but average length of stay dropped from 3.8 to 2.9 nights." },
  { id: 6, type: "Profitability", title: "Indian Cab Aggregator Profit Slowdown", difficulty: "Medium", style: "Candidate-led", prompt: "Your client is one of the two dominant cab aggregators in India. Growth of profits has stagnated over the past year despite overall market growth. Find the reasons and make recommendations.", context: "Client holds 38% market share (vs. competitor's 52%). Total Indian ride-hailing market: ~$7B GMV, growing 18% YoY. Client GMV: ~$2.7B. Commission rate: 18% (blended). Net revenue: ~$486M. Contribution margin: 12% (was 17% two years ago). Three segments: standard cars (60% of rides, 22% margin), auto-rickshaws (25% of rides, 8% margin), 2-wheelers (15% of rides, 5% margin). Rural/semi-rural expansion (launched 14 months ago): accounts for 20% of rides but only 9% of revenue and -3% contribution margin. Driver incentive spend up 40% YoY in rural markets." },
  { id: 7, type: "M&A / Due Diligence", title: "PE Acquisition of HR SaaS", difficulty: "Hard", style: "Candidate-led", prompt: "A private equity firm is considering acquiring a mid-size SaaS company focused on HR software. They want to know if this is a good investment.", context: "Target: $80M ARR, 120% NRR, growing 30% YoY, EBITDA -5% (-$4M). PE firm seeks 3x return in 5 years (implies ~25% IRR). Asking price: $320M (4x ARR). Average contract value (ACV): $48K. Customers: ~1,670. CAC: $62K, LTV: $290K (LTV/CAC = 4.7x). Gross margin: 72%. Sales & marketing: 38% of revenue. R&D: 22% of revenue. Main competitors: Workday (enterprise, $1,200 ACV) and SAP SuccessFactors (enterprise). Target serves mid-market (200–2,000 employees). Churn rate: 4% gross, offset by expansion." },
  { id: 8, type: "M&A / Due Diligence", title: "PE Investment in Sauce Manufacturer", difficulty: "Hard", style: "Interviewer-led", prompt: "Your client is a PE firm wanting to buy a stake in a sauce manufacturing company that produces both table sauces (ketchup, mustard) and new-age sauces (mayo, specialty condiments). The client wants to invest conditionally, asking the company to focus on just one segment. Do a commercial due diligence and recommend which segment.", context: "Total company revenue: INR 800 Cr. Revenue split: 30% table sauces (INR 240 Cr) / 70% new-age sauces (INR 560 Cr). Market growth: 8% for table sauces, 15% for new-age. Table sauce market size: INR 3,000 Cr; top 4 brands control 55% share; client is ~3.6% overall. New-age market size: INR 3,100 Cr; client is #2 with 18% share; market leader has 45% share. Operating margins: 25% table (INR 60 Cr EBIT), 35% new-age (INR 196 Cr EBIT). PE exit timeline: 5 years, target 15%+ annual return." },
  { id: 9, type: "Operations / Cost Reduction", title: "Hospital Supply Chain Overhaul (UAE)", difficulty: "Medium", style: "Interviewer-led", prompt: "A hospital network in the UAE is spending 30% more on supplies than comparable institutions. You have been brought in to identify the root cause and find savings.", context: "Network of 8 hospitals, ~4,000 beds total. Annual supply spend: AED 900M. Overspend vs. benchmark peers: 30% (~AED 207M excess). Cost breakdown: pharmaceuticals 45% (AED 405M), medical consumables 30% (AED 270M), equipment/devices 15% (AED 135M), other 10% (AED 90M). Procurement is fully decentralized. Estimated savings from centralized procurement: 15–20% on pharma, 10–12% on consumables. 3 major supplier contracts (covering ~AED 380M spend) up for renewal in 6 months. Inventory turnover: 6x/year vs. benchmark 9x/year." },
  { id: 10, type: "Operations / Cost Reduction", title: "E-Commerce Fulfillment Bottleneck", difficulty: "Hard", style: "Candidate-led", prompt: "A fast-growing e-commerce retailer is missing delivery SLAs on 35% of orders during peak season. Customer complaints are rising and they have lost two key retail partnerships. Fix it.", context: "Retailer does ~$400M GMV. Two fulfillment centers (Texas: 60% of volume, Ohio: 40%). Peak = Oct–Jan. Current SLA: 2-day delivery. Miss rate: was 8% last year, now 35% this peak. Headcount: +20% YoY. Order volume: +60% YoY. Average order value: $68. Cost per fulfilled order: $8.20 (was $6.40). Texas FC capacity: 18,000 orders/day (94% utilization peak). Ohio FC: 12,000 orders/day (88% peak). Carrier on-time rate: 91% (down from 96%). Returns rate: 22% (up from 17%). SLA miss reasons: picking/packing delays 55%, carrier delays 30%, inventory mismatches 15%." },
  { id: 11, type: "Go to Market", title: "B2B Fintech GTM Launch", difficulty: "Medium", style: "Candidate-led", prompt: "A fintech startup has built an AI-powered cash flow forecasting tool for SMEs. The product is ready. How should they go to market?", context: "Price: $299/month per business (~$3,588 ACV). Beta: 50 users, NPS 62, average time-to-value 4 days. TAM: 30M SMEs in the US; SAM: ~4M; SOM Y1 target: 2,000 customers. GTM budget: $2M. CAC target: <$800. LTV at 24-month avg retention: $7,176. Top beta segments: e-commerce 40%, professional services 30%, F&B 20%. Channels evaluated: accounting software integrations (QuickBooks, Xero), direct outbound, SME content/SEO. Sales cycle from beta: ~18 days." },
  { id: 12, type: "Go to Market", title: "Consumer Fitness App Expanding to LATAM", difficulty: "Medium", style: "Interviewer-led", prompt: "A US-based fitness app with 8M subscribers wants to expand into Latin America. Walk me through how you would approach the GTM strategy.", context: "App: $12.99/month, $120M ARR. US blended churn: 4.2%/month. LATAM population: 650M; urban smartphone penetration ~70% (~200M users). Fitness app market in LATAM: ~$800M, growing 22% YoY. Priority markets: Brazil ($320M fitness market), Mexico ($180M), Colombia ($85M). Avg willingness to pay in LATAM: ~$5–7/month. Local competitors: 3–4 players with <$30M revenue each. CAC estimate: $3.50–$5 in LATAM vs. $14 in US." },
  { id: 13, type: "Product Strategy", title: "Ride-Hailing Super App Pivot", difficulty: "Hard", style: "Mix", prompt: "A Southeast Asian ride-hailing company with dominant market share is considering expanding into financial services -- lending, insurance, and payments. Should they do it, and how?", context: "Company: 45M MAU, $1.8B revenue, EBITDA margin ~14%. Payments live: 30% of users (~13.5M), processing $2.4B GMV/year. Unbanked/underbanked: 70% of region (~360M people). SE Asia fintech market: $60B by 2025, growing 20% YoY. Lending TAM: $20B; Insurance TAM: $15B. Avg user transaction frequency: 8x/month. 36 months of mobility and payment data on 45M users. Digital banking licenses require $50–150M minimum capital. Projected fintech revenue by Year 3: $180–240M." },
  { id: 14, type: "Product Strategy", title: "Netflix India Revenue Growth", difficulty: "Hard", style: "Candidate-led", prompt: "Your client is Netflix India. They want to double their revenues in 5-6 years. How should they go about it?", context: "Netflix India current revenue: ~$500M. Target: $1B in 5–6 years (~15% CAGR). Current subscribers: ~8M. ARPU: ~$62/year ($5.2/month blended). India OTT market: ~$3B, growing 12–15% YoY. Top 3 players hold 75–80% share. Netflix India market share: ~17%. Competitor ARPU: Disney+ Hotstar ~$3/month, Amazon Prime ~$2/month. Mobile-only plan: $1.5/month. Tier-2+ cities: 65% of new internet users, <20% of Netflix India subscribers. Content spend India: ~$400M/year. Ad-supported tier: avg $3.2/user/month." },
  { id: 15, type: "Product Analysis", title: "Declining DAU on Social Platform", difficulty: "Hard", style: "Interviewer-led", prompt: "Daily active users on a social media platform's flagship app have dropped 18% over 6 months. The product team is under pressure. How do you diagnose this?", context: "Platform: 200M MAU. DAU/MAU: was 55% (110M DAU), now 45% (90M DAU) — loss of ~20M DAUs. Drop concentrated in 18–24 cohort (DAU down 31%). Avg session time: was 34 mins/day, now 26 mins/day. Competitor grew from 80M to 140M MAU after launching short-video 8 months ago. Notification opt-out rate: 18% → 29%. Content creation down 22%. Feed engagement rate down 14%. Ad revenue down 11% YoY." },
  { id: 16, type: "Product Analysis", title: "SaaS Trial-to-Paid Conversion Drop", difficulty: "Medium", style: "Mix", prompt: "A B2B SaaS company's free-to-paid conversion rate has dropped from 22% to 13% over one quarter. No pricing changes were made. What is going on and what do you recommend?", context: "Product: project management tool. Free trial: 14 days, full access. Paid tiers: $15/user/month (Team), $35/user/month (Business). Monthly trial starts: ~5,000. Revenue impact: ~$450K MRR lost. Drop started after major UI redesign. Paid churn: stable at 2.1%/month. Time-to-first-key-action: was 1.8 days, now 3.4 days. Trial users completing onboarding: dropped from 61% to 38%. Support tickets from trial users: up 65%. Feature usage in first 7 days: down 40% on core features." },
  { id: 17, type: "Channel Analysis", title: "CPG Brand: Retail vs. Direct-to-Consumer", difficulty: "Medium", style: "Candidate-led", prompt: "A consumer packaged goods company currently sells 90% of its products through retail chains. Leadership wants to evaluate whether to shift investment toward a direct-to-consumer channel. How do you think about this?", context: "Brand: premium skincare, $180M total revenue. Retail: $162M (90%), growing 5% YoY. DTC: $18M (10%), growing 40% YoY. Gross margin: 62% retail, 78% DTC. Retail gross profit: ~$100M. DTC gross profit: ~$14M. DTC CAC: $38, LTV: $210 (5.5x). Shelf presence: 3,200 doors. DTC avg order value: $85, repeat purchase rate: 58% within 12 months. Estimated DTC revenue at current trajectory: $25M in 12 months. Revenue at risk if retail partners react negatively: $30–50M." },
  { id: 18, type: "Channel Analysis", title: "Distributor vs. Direct Sales Force", difficulty: "Hard", style: "Interviewer-led", prompt: "An industrial equipment manufacturer currently sells through a network of 40 regional distributors. A new VP of Sales wants to shift to a direct sales model. Evaluate this decision.", context: "Company: $320M revenue. Distributor channel: 60% ($192M), 40 distributors avg $4.8M each. Direct channel: 40% ($128M), 35 reps avg $3.66M each. Average deal size: $80K. Sales cycle: 3–6 months. Distributor margin: 22% of sale price. Direct rep fully-loaded cost: ~$180K/year. Distributors provide last-mile service and spare parts (~$40M/year after-sales revenue at risk). Pilot markets (direct): grew 28% faster than distributor markets. Full migration requires ~55 additional reps (~$10M incremental annual cost). Transition risk: 12–18 months of revenue disruption." },
  { id: 19, type: "Profitability", title: "Sugar Mill Cost Spike", difficulty: "Easy", style: "Interviewer-led", prompt: "Your client owns a sugar mill in India. They process sugarcane into sugar and jaggery. Profitability has declined over the past year while competitors are doing fine. Find out why.", context: "Annual revenue: INR 120 Cr (unchanged YoY). EBITDA margin: was 18% (INR 21.6 Cr), now 11% (INR 13.2 Cr) — erosion of INR 8.4 Cr. Volume processed: 180,000 tonnes/year (unchanged). Cost structure: raw material 55%, electricity 20%, labour 12%, other 13%. Electricity cost this year: INR 24 Cr (was INR 16 Cr — up 50%). Reason: ageing machines consuming 40% more electricity per tonne than modern equipment. Competitors use bagasse for captive power — effectively zero electricity cost. Bagasse yield: ~30% of cane weight. Capex for new machinery + bagasse boiler: INR 18 Cr, payback ~2.1 years." },
  { id: 20, type: "Profitability", title: "Airport Eatery Revenue Growth", difficulty: "Easy", style: "Mix", prompt: "Your client is a major metropolitan airport. They want to increase revenue generated from eateries inside the terminal. The commission rate on eatery sales is fixed at 11% and cannot be changed. Walk me through how you would approach this.", context: "Airport handles 40M passengers/year (~110,000/day). Current eatery sales: INR 180 Cr/year. Airport commission: INR 19.8 Cr/year. Average spend per dining passenger: INR 380. Dining conversion rate: ~12% of passengers. Benchmark airports: 18–22% conversion, avg spend INR 420–460. 14 eatery outlets currently. South Indian is most popular (35% of sales). Pre-booked food: 0.02% of passengers. Peak hours: 6–9am and 5–9pm (65% of daily footfall). Segments: corporate travelers (avg spend INR 620, 25% of pax), early-arrival browsers (INR 180, 40%), average hungry travelers (INR 410, 35%)." },
  { id: 21, type: "Market Entry", title: "Indian 2-Wheeler Brand Goes Global", difficulty: "Easy", style: "Candidate-led", prompt: "An Indian two-wheeler company specializing in affordable commuter bikes and mid-range scooters wants to expand into foreign markets. The domestic market is saturated. Which geographies would you suggest, and why?", context: "Client revenue: INR 22,000 Cr (~$2.6B). Domestic market share: 18% (3rd largest). Avg selling price: INR 75,000 (~$900). Manufacturing cost advantage: 22% below Japanese competitors. Vietnam — 2W market 3.2M units/year, 95% penetration, Honda/Yamaha hold 78% share, avg price $1,100. Brazil — 1.1M units/year, 42% penetration, fragmented (top 3 hold 55%), avg price $1,800, 35% import duty. Nigeria — 1.8M units/year, 18% penetration (high growth), Chinese players dominate at $600–800, avg price $750, 15% import duty. Export revenue currently: INR 800 Cr (4% of total)." },
  { id: 22, type: "Go to Market", title: "BHIM UPI 2.0 Market Share Push", difficulty: "Easy", style: "Interviewer-led", prompt: "You are advising the CEO of NPCI. They want to grow BHIM UPI 2.0's market share from 0.1% to 5% in 3 years. How would you approach this?", context: "Total UPI volume: 10B transactions/month (INR 15 trillion/month). BHIM current share: 0.1% (~10M transactions/month). Target: 5% = 500M transactions/month. Google Pay: 37% share, PhonePe: 48%, others: 14.9%. BHIM transaction failure rate: 4.2% vs. industry avg 1.1%. BHIM MAU: ~8M vs. PhonePe 250M, Google Pay 180M. Target: semi-urban/rural — 650M people, smartphone penetration 45%, UPI awareness 38%. Avg transaction value on BHIM: INR 1,850. NPCI budget: INR 500 Cr over 3 years. Rural merchant acceptance points: 2.8M (vs. 18M urban)." },
  { id: 23, type: "Operations / Cost Reduction", title: "Equipment Manufacturer Price Increase Decision", difficulty: "Easy", style: "Mix", prompt: "Your client is an electronic components manufacturer that makes transistors for both B2B and B2C customers. They are evaluating whether to increase prices by 10% and want your help to decide.", context: "B2C: price Rs.1,000/unit, volume 10,000 units/month, variable cost 40% (Rs.400/unit), price elasticity -1.2. B2B: price Rs.100,000/unit, volume 1,000 units/month, variable cost 50% (Rs.50,000/unit), price elasticity -0.8. Fixed costs: Rs.400,000/year per segment. Proposed price increase: 10%. Current monthly contribution — B2C: Rs.6M; B2B: Rs.50M. Post-increase volumes: B2C 8,800 units; B2B 920 units. Post-increase contribution — B2C: Rs.5.8M (down); B2B: Rs.50.6M (up). Net: B2C loses Rs.0.2M/month; B2B gains Rs.0.6M/month. Recommendation: increase B2B price, hold B2C." },
  { id: 24, type: "Profitability", title: "Western Dessert Manufacturer Profit Decline", difficulty: "Easy", style: "Interviewer-led", prompt: "Your client is a manufacturer of western desserts operating across metro and Tier-1 cities in India. Profits have declined over the past 6-9 months. Help them understand why.", context: "Client revenue: INR 85 Cr (down from INR 102 Cr — decline of 17%). EBITDA: INR 6 Cr (down from INR 18 Cr — margin fell from 17.6% to 7%). Top-5 brand nationally. Channels: own stores 60%, online delivery 40%. Industry-wide issue. Raw material costs up 28% YoY. Cocoa prices up 3x globally. Cocoa as % of raw material cost: 45%. Volume decline: purchase frequency dropped 22% after recipe change. Avg ticket: INR 420 (own stores), INR 380 (online). Online delivery commission: 28% of order value." },
  { id: 25, type: "Go to Market", title: "Pharma Company Losing Ground to Competitor", difficulty: "Easy", style: "Candidate-led", prompt: "A global pharma company entered the Indian breast cancer drug market two years ago. A competitor entered one year earlier with a similar drug and now has dominant market share. How would you improve our client's performance in India?", context: "Client market share: 18% (INR 90 Cr revenue). Competitor: 54% (INR 270 Cr). Total market: ~INR 500 Cr, growing 14% YoY. Both drugs: similarly priced at INR 12,000/cycle, similarly effective. Client MRP floor: INR 10,500/cycle. ~180,000 new breast cancer cases/year; ~60,000 eligible for this drug class. Distribution: client reaches 420 hospitals (competitor: 780). Oncologist rep visits: competitor 2.1x more per doctor per month. Patient financing: competitor offers 0% EMI over 12 months with INR 2,000 down payment; client requires INR 8,000 upfront. Patients lost to affordability barrier: ~35% of eligible." },
];

const SYSTEM_PROMPT = (caseData: any, style: string): string => {
  const styleGuide = style === "Interviewer-led"
    ? `INTERVIEWER-LED (McKinsey style): You own the agenda. After every candidate response, follow up immediately with one sharp, targeted question. Push for quantification naturally: "Can you rough-size that?" / "What order of magnitude are we talking?" / "How does that number change the answer?" Never wait passively. Opening: warm one-liner + paraphrase the situation in 2-3 natural sentences (never read the prompt verbatim) + state the core question + "Take a moment if you need, then walk me through your thinking."`
    : style === "Candidate-led"
    ? `CANDIDATE-LED (BCG/Bain style): Warm but fully hands-off. Opening: brief warm greeting + 1-2 natural sentences setting the scene + pose the question, then stop. No structural hints, no "take a moment." After opening go silent — only respond when the candidate asks a direct question or has genuinely stalled for 2+ exchanges. If they ask your view, deflect: "What's your read on that?" One light nudge if completely stuck, then silent again.`
    : `MIX: Opening: brief warm greeting + 2 natural sentences + core question + "Over to you." Start hands-off and let them drive. Once a framework is laid out, begin to engage — follow interesting threads, push on quant avoidance, redirect if they drift. Shift more directive if they stall or lose momentum.`;

  return `LANGUAGE RULE — NON-NEGOTIABLE: Every single word you write must be in English. No Spanish. No other language. English only, always, without exception.

You are a senior case interviewer at McKinsey, BCG, or Bain conducting a live case interview. You are warm, rigorous, and measured — you sound like a real person in a room, not a chatbot.

CASE: ${caseData.title} | ${caseData.type} | ${style}
Situation (use this only to set the scene in the opening): ${caseData.prompt}
Background data — NEVER mention in the opening. Share specific facts ONLY when the candidate asks a direct, well-framed question during the interview: ${caseData.context}

HOW TO SPEAK: You speak the way real MBB interviewers do. Short, clear sentences. No filler. Never say "Excellent!" or "Great point!" — that is not how consultants talk. When something is sharp, you say "Good." or "Right." or "Sharp." and immediately move on. When pushing for more: "Say more about that." / "And then what?" / "I'm not following the logic there." When challenging weak reasoning: "How is that MECE with what you just said?" / "What's driving that assumption?" / "That's quite broad — where specifically would you look first?" When delivering data, be matter-of-fact: "Sure. So the market here is roughly X. The cost breakdown looks like Y."

RESPONSE APPROACH:
— When the candidate gives substantive input: engage with what they actually said in at least 3 sentences, then ask one follow-up. No upper limit on length — be as thorough as the moment warrants.
— When the candidate earns data with a specific, well-framed question: briefly acknowledge ("Good instinct." / "Right question."), then deliver the relevant numbers completely and naturally, then ask one follow-up: "What does that tell you?" / "How does that change your view?"
— One question per turn. Never stack questions.
— No markdown, no bullets, no headers. Plain spoken sentences only — this is a spoken conversation.
— Never volunteer data unprompted. If they ask vaguely, ask them to be more specific first.
— Never invent things the candidate said. Only evaluate what they literally typed.
— Filler inputs ("ok", "sure", single words): re-invite warmly. "Go ahead — walk me through it."
— /feedback and /score: only from what candidate actually said. If they've said very little, be honest and warm: "Honestly, I'd need to see how you actually approach this before I can give you anything useful — get into the case first."

STYLE: ${styleGuide}

SILENT EVALUATION — track throughout, surface only on command:
1. Structure and MECE thinking  2. Hypothesis-driven approach  3. Quantitative comfort  4. Communication clarity  5. Insight and recommendation quality

/hint → one subtle nudge, no answers  |  /feedback → structured feedback across all 5 dimensions  |  /score → 1–10 per dimension, one sentence justification each

OPENING RULE: Your opening must not contain any numbers, financial figures, market sizes, costs, revenues, or any specific data from the background. The opening is only a warm scene-setter using the situation description. All data stays locked until the candidate asks for it.

FINAL REMINDER: Respond in English only. Every word.

Open the case now.`;
};

const TYPE_COLORS: Record<string, string> = {
  "Market Entry": "#6366f1",
  "Profitability": "#f59e0b",
  "M&A / Due Diligence": "#ec4899",
  "Operations / Cost Reduction": "#10b981",
  "Go to Market": "#3b82f6",
  "Product Strategy": "#8b5cf6",
  "Product Analysis": "#ef4444",
  "Channel Analysis": "#14b8a6",
};

export default function CaseCoach() {
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [messages, setMessages] = useState<{role: string; content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("select");
  const [filter, setFilter] = useState("All");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [activeModel, setActiveModel] = useState(MODEL_ORDER.Medium[0]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const modelIdxRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const speak = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    const clean = text
      .replace(/[*_`#]/g, "")
      .replace(/\/\w+/g, "")
      .replace(/━+[^━]*━+/g, "")
      .trim();
    if (!clean) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const { audioContent } = await res.json();
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); audioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); audioRef.current = null; };
      audio.play();
    } catch {
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  const stopSpeaking = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsSpeaking(false);
  };

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported in this browser. Try Chrome."); return; }
    stopSpeaking();
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    let finalText = "";
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalText += e.results[i][0].transcript + " ";
        } else {
          interim = e.results[i][0].transcript;
        }
      }
      const combined = finalText.trimEnd() + (interim ? " " + interim : "");
      setTranscript(interim);
      setInput(combined.trim());
    };
    rec.onend = () => {
      if (recognitionRef.current === rec) {
        try { rec.start(); } catch (_) {}
      } else {
        setIsListening(false);
        setTranscript("");
      }
    };
    rec.onerror = (e: any) => {
      if (e.error === "no-speech" && recognitionRef.current === rec) {
        try { rec.start(); } catch (_) {}
      } else if (recognitionRef.current === rec) {
        recognitionRef.current = null;
        setIsListening(false);
        setTranscript("");
      }
    };
    recognitionRef.current = rec;
    rec.start();
  }, []);

  const stopListening = () => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    rec?.stop();
    setIsListening(false);
    setTranscript("");
  };

  const isSpanish = (text: string): boolean => {
    const markers = /\b(el |la |los |las |de |que |es |en |un |una |con |para |por |como |está|están|tiene|tienen|pero |también|esto |esta |ese |esa |del |al |lo |le |se |su |más |muy |todo|toda|cuando|donde|quien|porque|aunque|sino|cada|otro|otra)\b/gi;
    return (text.match(markers) ?? []).length >= 3;
  };

  const callAPI = async (
    msgs: {role: string; content: string}[],
    caseData: any,
    onChunk: (accumulated: string) => void,
    retried = false
  ): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? "";
    const modelList = MODEL_ORDER[caseData.difficulty] ?? MODEL_ORDER.Medium;
    const model = modelList[modelIdxRef.current] ?? modelList[0];

    const payload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT(caseData, caseData.style) }] },
      contents: msgs.map((m, i) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: i === msgs.length - 1 && m.role === "user"
          ? m.content + "\n\n[RESPOND IN ENGLISH ONLY. No Spanish. No other language.]"
          : m.content }],
      })),
      generationConfig: { maxOutputTokens: 800, temperature: 0.75 },
    };

    const switchModel = async (): Promise<string> => {
      if (retried) throw new Error("quota");
      const next = Math.min(modelIdxRef.current + 1, modelList.length - 1);
      modelIdxRef.current = next;
      setActiveModel(modelList[next]);
      return callAPI(msgs, caseData, onChunk, true);
    };

    let fullText = "";
    try {
      const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const sRes = await fetch(streamUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (sRes.status === 429 || sRes.status === 503) return switchModel();
      if (sRes.ok && sRes.body) {
        const reader = sRes.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const part = JSON.parse(json)?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
              if (part) { fullText += part; onChunk(fullText); }
            } catch {}
          }
        }
      }
    } catch {}

    if (!fullText) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.status === 429 || res.status === 503) return switchModel();
      if (!res.ok) throw new Error("API " + res.status);
      const data = await res.json();
      fullText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (fullText) onChunk(fullText);
    }

    if (!fullText) throw new Error("empty response");

    if (!retried && isSpanish(fullText)) {
      const corrected = [...msgs, { role: "assistant", content: fullText }, { role: "user", content: "Please repeat your last response in English only." }];
      return callAPI(corrected, caseData, onChunk, true);
    }

    return fullText;
  };

  const startCase = async (c: any) => {
    const models = MODEL_ORDER[c.difficulty] ?? MODEL_ORDER.Medium;
    modelIdxRef.current = 0;
    setActiveModel(models[0]);
    setSelectedCase(c); setMessages([]); setPhase("chat"); setLoading(true);
    const initMsgs = [{ role: "user", content: "Please begin the case interview." }];
    let firstChunk = true;
    try {
      const text = await callAPI(initMsgs, c, (partial) => {
        if (firstChunk) { firstChunk = false; setLoading(false); }
        setMessages([{ role: "assistant", content: partial }]);
      });
      setMessages([{ role: "assistant", content: text }]);
      speak(text);
    } catch {
      setMessages([{ role: "assistant", content: "The app is currently experiencing high demand, please try again in a moment." }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (overrideInput?: string) => {
    const userMsg = (overrideInput || input).trim();
    if (!userMsg || loading) return;
    setInput("");
    const updated = [...messages, { role: "user", content: userMsg }];
    setMessages(updated);
    setLoading(true);
    const apiMsgs = updated.map(m => ({ role: m.role, content: m.content }));
    let firstChunk = true;
    try {
      const text = await callAPI(apiMsgs, selectedCase, (partial) => {
        if (firstChunk) { firstChunk = false; setLoading(false); }
        setMessages([...updated, { role: "assistant", content: partial }]);
      });
      setMessages([...updated, { role: "assistant", content: text }]);
      speak(text);
    } catch {
      setMessages([...updated, { role: "assistant", content: "The app is currently experiencing high demand, please try again in a moment." }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const types = ["All", "Market Entry", "Profitability", "M&A / Due Diligence", "Operations / Cost Reduction", "Go to Market", "Product Strategy", "Product Analysis", "Channel Analysis"];
  const filtered = filter === "All" ? CASES : CASES.filter(c => c.type === filter);

  // ── SELECT SCREEN ──
  if (phase === "select") return (
    <div style={{ minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif", position: "relative", overflow: "hidden", color: "#0D1B2A" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
        @keyframes float-orb-1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.05); } }
        @keyframes float-orb-2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,30px) scale(0.97); } }
        @keyframes float-orb-3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px,20px) scale(1.03); } }
        .case-card { transition: transform 0.28s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.28s ease; }
        .case-card:hover { transform: translateY(-3px) scale(1.005); box-shadow: 0 16px 48px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,1) !important; }
        .filter-pill { transition: all 0.18s ease; }
        .filter-pill:hover { transform: scale(1.04); }
      `}</style>

      {/* Background gradient */}
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(145deg, #dce8ff 0%, #ede6ff 30%, #d8f5ea 62%, #ffe8f0 100%)", zIndex: 0 }} />

      {/* Floating colour orbs */}
      <div style={{ position: "fixed", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 68%)", top: -180, left: -140, zIndex: 0, animation: "float-orb-1 14s ease-in-out infinite" }} />
      <div style={{ position: "fixed", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,166,81,0.18) 0%, transparent 68%)", bottom: -80, right: -100, zIndex: 0, animation: "float-orb-2 18s ease-in-out infinite" }} />
      <div style={{ position: "fixed", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,48,135,0.14) 0%, transparent 68%)", top: "38%", right: "12%", zIndex: 0, animation: "float-orb-3 11s ease-in-out infinite" }} />
      <div style={{ position: "fixed", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 68%)", top: "15%", right: "30%", zIndex: 0, animation: "float-orb-1 16s ease-in-out infinite reverse" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "56px 20px 88px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h1 style={{
            fontSize: "clamp(48px, 8vw, 80px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            marginBottom: 18,
            background: "linear-gradient(140deg, #003087 0%, #6366f1 45%, #00A651 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Case Coach
          </h1>
          <p style={{ color: "rgba(0,0,0,0.42)", fontSize: 15, maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.75, letterSpacing: "-0.01em" }}>
            25 cases across 8 types. Type{" "}
            <span style={{ color: "#003087", fontWeight: 600 }}>/hint</span>,{" "}
            <span style={{ color: "#003087", fontWeight: 600 }}>/feedback</span>, or{" "}
            <span style={{ color: "#003087", fontWeight: 600 }}>/score</span> anytime.
          </p>

          {/* Stat chips */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {[["25 Cases", "#5856D6"], ["8 Types", "#00A651"], ["Voice I/O", "#C8102E"], ["3 Levels", "#003087"]].map(([label, color]) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(18px) saturate(180%)",
                WebkitBackdropFilter: "blur(18px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.85)",
                borderRadius: 50,
                padding: "7px 18px",
                fontSize: 12,
                fontWeight: 600,
                color: color as string,
                letterSpacing: "0.01em",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
              }}>{label}</div>
            ))}
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, justifyContent: "center" }}>
          {types.map(t => (
            <button
              key={t}
              className="filter-pill"
              onClick={() => setFilter(t)}
              style={{
                background: filter === t ? "rgba(0,48,135,0.88)" : "rgba(255,255,255,0.55)",
                backdropFilter: "blur(16px) saturate(180%)",
                WebkitBackdropFilter: "blur(16px) saturate(180%)",
                border: filter === t ? "1px solid rgba(0,48,135,0.25)" : "1px solid rgba(255,255,255,0.85)",
                color: filter === t ? "#fff" : "rgba(0,0,0,0.5)",
                borderRadius: 50,
                padding: "7px 18px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
                boxShadow: filter === t
                  ? "0 4px 18px rgba(0,48,135,0.28)"
                  : "0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",
              }}
            >{t}</button>
          ))}
        </div>

        {/* Case cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(c => (
            <div
              key={c.id}
              className="case-card"
              onClick={() => startCase(c)}
              style={{
                background: "rgba(255,255,255,0.58)",
                backdropFilter: "blur(26px) saturate(200%)",
                WebkitBackdropFilter: "blur(26px) saturate(200%)",
                border: "1px solid rgba(255,255,255,0.88)",
                borderRadius: 20,
                padding: "18px 22px",
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Type accent bar */}
              <div style={{
                width: 4,
                height: 50,
                borderRadius: 4,
                background: TYPE_COLORS[c.type],
                flexShrink: 0,
                opacity: 0.8,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: TYPE_COLORS[c.type], letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.type}</span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(0,0,0,0.18)", display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: "rgba(0,0,0,0.38)", letterSpacing: "-0.01em" }}>{c.style}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0D1B2A", marginBottom: 4, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.38)", lineHeight: 1.55, letterSpacing: "-0.01em" }}>{c.prompt.slice(0, 100)}…</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 50,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  background: c.difficulty === "Easy"
                    ? "rgba(0,166,81,0.10)" : c.difficulty === "Medium"
                    ? "rgba(245,158,11,0.10)" : "rgba(200,16,46,0.10)",
                  color: c.difficulty === "Easy" ? "#005C2E" : c.difficulty === "Medium" ? "#7A4A00" : "#8B0000",
                  border: `1px solid ${c.difficulty === "Easy" ? "rgba(0,166,81,0.22)" : c.difficulty === "Medium" ? "rgba(245,158,11,0.22)" : "rgba(200,16,46,0.22)"}`,
                }}>{c.difficulty}</span>
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "rgba(0,48,135,0.07)",
                  border: "1px solid rgba(0,48,135,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  color: "#003087",
                }}>→</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── CHAT SCREEN ──
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif", position: "relative", overflow: "hidden", color: "#0D1B2A" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }
        textarea { background: transparent; border: none; outline: none; color: #0D1B2A; font-family: inherit; font-size: 14px; resize: none; flex: 1; line-height: 1.65; letter-spacing: -0.01em; }
        textarea::placeholder { color: rgba(0,0,0,0.3); }
        @keyframes bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.5; } 40% { transform: translateY(-5px); opacity: 1; } }
        @keyframes mic-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(200,16,46,0.3); } 50% { box-shadow: 0 0 0 7px rgba(200,16,46,0); } }
        @keyframes float-orb-1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(25px,-18px); } }
        @keyframes float-orb-2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-18px,25px); } }
        .dot { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; animation: bounce 1.3s ease infinite; display: inline-block; }
        .dot:nth-child(2) { animation-delay: 0.18s; }
        .dot:nth-child(3) { animation-delay: 0.36s; }
        .glass-btn { transition: all 0.15s ease; }
        .glass-btn:hover { transform: scale(1.08); }
        .glass-btn:active { transform: scale(0.96); }
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(145deg, #dce8ff 0%, #ede6ff 30%, #d8f5ea 62%, #ffe8f0 100%)", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 68%)", top: -150, left: -120, zIndex: 0, animation: "float-orb-1 14s ease-in-out infinite" }} />
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,166,81,0.14) 0%, transparent 68%)", bottom: -80, right: -80, zIndex: 0, animation: "float-orb-2 18s ease-in-out infinite" }} />

      {/* Header — glass bar */}
      <div style={{
        position: "relative", zIndex: 10,
        padding: "13px 18px",
        background: "rgba(255,255,255,0.68)",
        backdropFilter: "blur(32px) saturate(200%)",
        WebkitBackdropFilter: "blur(32px) saturate(200%)",
        borderBottom: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
      }}>
        <button
          className="glass-btn"
          onClick={() => { setPhase("select"); setSelectedCase(null); setMessages([]); stopSpeaking(); }}
          style={{
            background: "rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.08)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 10, padding: "6px 14px",
            color: "rgba(0,0,0,0.55)", cursor: "pointer", fontSize: 13,
            fontFamily: "inherit", fontWeight: 500, letterSpacing: "-0.01em",
          }}
        >← Cases</button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.02em" }}>{selectedCase?.title}</div>
          <div style={{ fontSize: 11, color: "rgba(0,0,0,0.38)", marginTop: 1, letterSpacing: "-0.01em" }}>{selectedCase?.type} · {selectedCase?.style} · {selectedCase?.difficulty}</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {isSpeaking && (
            <button className="glass-btn" onClick={stopSpeaking} style={{ background: "rgba(0,48,135,0.08)", border: "1px solid rgba(0,48,135,0.14)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15 }}>🔊</button>
          )}
          <button
            className="glass-btn"
            onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) stopSpeaking(); }}
            style={{
              background: voiceEnabled ? "rgba(0,48,135,0.08)" : "rgba(0,0,0,0.05)",
              border: voiceEnabled ? "1px solid rgba(0,48,135,0.14)" : "1px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              borderRadius: 10, width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 15, opacity: voiceEnabled ? 1 : 0.45,
            }}
          >{voiceEnabled ? "🔈" : "🔇"}</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 18px", display: "flex", flexDirection: "column", gap: 14, position: "relative", zIndex: 1 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "assistant" ? "row" : "row-reverse", gap: 10, alignItems: "flex-end" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: m.role === "assistant"
                ? "linear-gradient(135deg, #003087 0%, #6366f1 100%)"
                : "rgba(255,255,255,0.65)",
              border: m.role === "assistant" ? "none" : "1px solid rgba(255,255,255,0.9)",
              backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
              boxShadow: m.role === "assistant" ? "0 2px 10px rgba(0,48,135,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, flexShrink: 0,
            }}>
              {m.role === "assistant" ? "🎓" : "👤"}
            </div>
            <div style={{
              maxWidth: "78%", padding: "12px 16px",
              background: m.role === "assistant"
                ? "rgba(99,102,241,0.07)"
                : "rgba(255,255,255,0.68)",
              backdropFilter: "blur(22px) saturate(180%)",
              WebkitBackdropFilter: "blur(22px) saturate(180%)",
              border: m.role === "assistant"
                ? "1px solid rgba(99,102,241,0.14)"
                : "1px solid rgba(255,255,255,0.92)",
              borderRadius: m.role === "assistant" ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
              boxShadow: "0 2px 18px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
            }}>
              <div style={{ fontSize: 14, lineHeight: 1.72, color: m.role === "assistant" ? "#1a2f5a" : "#374151", whiteSpace: "pre-wrap", letterSpacing: "-0.01em" }}>{m.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#003087,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, boxShadow: "0 2px 10px rgba(0,48,135,0.3)", flexShrink: 0 }}>🎓</div>
            <div style={{ padding: "14px 18px", background: "rgba(99,102,241,0.07)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(99,102,241,0.14)", borderRadius: "18px 18px 18px 4px", boxShadow: "0 2px 18px rgba(0,0,0,0.06)", display: "flex", gap: 5, alignItems: "center" }}>
              <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div style={{
        position: "relative", zIndex: 10,
        padding: "12px 16px 20px",
        background: "rgba(255,255,255,0.68)",
        backdropFilter: "blur(32px) saturate(200%)",
        WebkitBackdropFilter: "blur(32px) saturate(200%)",
        borderTop: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 -1px 0 rgba(0,0,0,0.03)",
        flexShrink: 0,
      }}>
        {(isListening || transcript) && (
          <div style={{
            marginBottom: 8, padding: "8px 14px",
            background: "rgba(200,16,46,0.05)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(200,16,46,0.14)",
            borderRadius: 12, fontSize: 13, color: "#C8102E",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C8102E", display: "inline-block", animation: "mic-pulse 1s ease infinite" }} />
            {transcript || "Listening…"}
          </div>
        )}

        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.95)",
          borderRadius: 18, padding: "10px 12px",
          boxShadow: "0 2px 18px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
        }}>
          <textarea
            ref={inputRef}
            rows={2}
            placeholder="Type your response or use the mic…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button
            className="glass-btn"
            onClick={isListening ? stopListening : startListening}
            disabled={loading}
            style={{
              background: isListening ? "rgba(200,16,46,0.1)" : "rgba(0,0,0,0.05)",
              border: isListening ? "1px solid rgba(200,16,46,0.22)" : "1px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              borderRadius: 12, width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 17, flexShrink: 0,
              animation: isListening ? "mic-pulse 1s ease infinite" : "none",
            }}
          >{isListening ? "⏹" : "🎙️"}</button>

          <button
            className="glass-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              background: "linear-gradient(135deg, #003087 0%, #6366f1 100%)",
              border: "none",
              borderRadius: 12, width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontSize: 17, flexShrink: 0, color: "white",
              opacity: loading || !input.trim() ? 0.32 : 1,
              boxShadow: loading || !input.trim() ? "none" : "0 4px 16px rgba(0,48,135,0.3)",
            }}
          >↑</button>
        </div>

        {/* Command pills */}
        <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "center" }}>
          {["/hint", "/feedback", "/score"].map(cmd => (
            <button
              key={cmd}
              className="glass-btn"
              onClick={() => { setInput(cmd); setTimeout(() => sendMessage(cmd), 50); }}
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.88)",
                borderRadius: 50, padding: "5px 16px",
                color: "#003087", fontSize: 12, cursor: "pointer",
                fontFamily: "inherit", fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",
                letterSpacing: "0.01em",
              }}
            >{cmd}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
