# MandiMatrix — Project Specification for Codex

> Yeh document Codex (ya kisi bhi AI-coding-agent) ko dene ke liye hai. Isko poora paste karo Codex ke pehle-prompt mein, phir feature-by-feature implement karwao.

## Project Overview

**MandiMatrix** ek web-based platform hai jo Indian farmers ko:
1. Real-time mandi (agricultural market) prices dikhata hai multiple-nearby-markets ka
2. Net-profit calculate karta hai (price minus transport-cost) taaki farmer sahi-mandi choose kar sake
3. AI se price-trend explain karta hai aur "kab bechna behtar hai" advise karta hai
4. Farmers ko directly verified-buyers se connect karta hai (middleman bypass) — lot-listing + digital-offers ke through
5. Hindi/Marathi voice-interface deta hai (accessibility ke liye)
6. Dispute/grievance-tracking deta hai transparency ke liye

Built for SIH26132 — "Strengthening market linkages and price discovery for farmers" (Government of Maharashtra / SIH 2026).

## Tech Stack (fixed — inhi ko use karo)

- **Frontend**: React + Vite + Tailwind CSS (responsive, mobile-friendly)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose) — flexible-schema ke liye achha hai jaldi-prototype-karne mein
- **AI/LLM**: Anthropic Claude API (ya OpenAI API) — price-trend-explanation aur chatbot ke liye
- **Voice**: Web Speech API (browser-native, free, no-setup) for STT/TTS — Hindi/Marathi support ke liye
- **External Data**: data.gov.in Agmarknet API (Variety-wise Daily Market Prices dataset)
- **Hosting (demo)**: Frontend → Vercel/Netlify | Backend → Render/Railway | DB → MongoDB Atlas (free-tier)

## Folder Structure

```
mandimatrix/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI pieces (PriceCard, LotCard, ChatWidget, etc.)
│   │   ├── pages/             # Dashboard, FarmerLogin, BuyerLogin, LotListing, PriceCompare, Disputes
│   │   ├── services/          # api.js (axios calls to backend)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── routes/                # priceRoutes.js, lotRoutes.js, buyerRoutes.js, disputeRoutes.js, chatRoutes.js
│   ├── controllers/           # matching logic, business logic per route
│   ├── models/                # Mongoose schemas: Farmer, Buyer, Lot, Offer, Dispute
│   ├── services/               # agmarknetService.js (fetch+cache price-data), llmService.js (Claude/GPT wrapper)
│   ├── server.js
│   └── package.json
└── README.md
```

## Data Models (MongoDB Schemas)

### Farmer
```
{ name, phone, location: {state, district, village}, preferredLanguage: "hi"|"mr"|"en", createdAt }
```

### Buyer
```
{ name, phone, businessType, verified: Boolean, location, createdAt }
```

### Lot (farmer's crop-listing)
```
{ farmerId, cropType, quantity (in quintal), qualityGrade: "A"|"B"|"C" (self-declared),
  location, listedAt, auctionWindowEnd, status: "listed"|"offers_received"|"accepted"|"completed",
  acceptedOfferId (optional) }
```

### Offer (buyer's bid on a lot)
```
{ lotId, buyerId, pricePerQuintal, message, submittedAt, status: "pending"|"accepted"|"rejected" }
```

### Dispute
```
{ lotId, raisedBy: "farmer"|"buyer", category: "payment"|"quality"|"other", description, status: "open"|"resolved", createdAt }
```

## Features to Build — In Priority Order

### 🔴 PHASE 1 — Core (build this first, fully functional)

1. **Price Comparison Module**
   - Backend: `services/agmarknetService.js` — fetch data from data.gov.in Agmarknet API (or use a cached/mock JSON if API is rate-limited), cache in MongoDB with daily refresh
   - Endpoint: `GET /api/prices?crop=wheat&state=MP&district=Indore` → returns prices from 3-4 nearby mandis
   - Frontend: `PriceCompare.jsx` page — dropdown for crop + location, shows a comparison table/cards

2. **Net-Profit Calculator**
   - Simple formula: `netProfit = mandiPrice - (transportCostPerKm * distanceToMandi)`
   - Distance can be hardcoded/estimated for demo (or use a simple lat-long distance formula between farmer's location and mandi location)
   - Show ranked list: "Mandi X — Net profit ₹Y (after transport)"

3. **Price Trend Chart**
   - Use `recharts` (React charting library) to show a line-chart of price-history for selected crop over last 30 days
   - Data from cached Agmarknet historical data

4. **Farmer Registration/Login**
   - Simple form: name, phone, location — no need for complex auth (OTP can be mocked for demo)

### 🟡 PHASE 2 — Differentiators (build after Phase 1 works end-to-end)

5. **AI Price-Trend Explanation + Chatbot**
   - `services/llmService.js` — wrapper function that sends price-history + user-question to Claude/GPT API, returns natural-language explanation
   - Example prompt: "Given this price data for wheat in Indore over 30 days: [data], explain in simple Hindi why the price is trending this way and suggest the best time to sell."
   - Frontend: floating chatbot widget (`ChatWidget.jsx`) — text input, calls `/api/chat` endpoint

6. **Voice Interface (Hindi/Marathi)**
   - Use browser's native `SpeechRecognition` (STT) and `SpeechSynthesis` (TTS) Web APIs — no external API needed, works in Chrome
   - Add a mic-button next to the chatbot that lets farmer speak their question instead of typing

7. **Lot Creation + Buyer Matching**
   - Farmer creates a "lot" (crop, quantity, quality-grade dropdown, location) → `POST /api/lots`
   - Simple matching logic: `GET /api/lots/:id/matching-buyers` — filter buyers by businessType/location relevance (rule-based, not ML)
   - Notify (mock — just show in buyer's dashboard, no real SMS needed for demo) registered buyers of new lots

8. **Digital Offers**
   - Buyer views open lots → submits an offer (`POST /api/offers` with lotId, pricePerQuintal)
   - Farmer sees all offers for their lot, clicks "Accept" → lot status changes to "accepted"

### 🟢 PHASE 3 — If time permits / else show as mockup only

9. **Dispute/Grievance System**
   - Simple form: select lot, category (payment/quality/other), description → `POST /api/disputes`
   - Admin/status page showing dispute list with status badges

10. **Payment Status Tracker** (MOCK ONLY — do not build real payment gateway)
    - Static status field on lot: "Payment Pending" → "Payment Received" (manually toggled for demo, or simple button "Mark as Paid")

## API Endpoints Summary

```
GET    /api/prices?crop=&state=&district=
GET    /api/prices/trend?crop=&district=&days=30
POST   /api/farmers/register
POST   /api/buyers/register
POST   /api/lots
GET    /api/lots
GET    /api/lots/:id/matching-buyers
POST   /api/offers
PATCH  /api/offers/:id/accept
POST   /api/disputes
GET    /api/disputes
POST   /api/chat   (body: { message, cropContext })
```

## Important Notes for Codex

- **Do NOT build real payment-gateway integration** — mock it with a simple status field, mention "future integration with Razorpay/UPI" in comments.
- **Do NOT build AI-based image quality-grading (computer vision)** — quality grade is self-declared by farmer via dropdown (A/B/C). This avoids needing ML model training.
- **Keep auth simple** — phone-number + name is enough for demo, no need for full OTP/JWT-security unless time permits.
- **If Agmarknet API is slow/rate-limited**, create a fallback: seed MongoDB with realistic mock price-data for wheat, soybean, potato in Madhya Pradesh districts (Indore, Bhopal, Ujjain) so the demo never breaks live.
- Keep UI **mobile-responsive** (Tailwind's responsive classes) since judges may view on phone.
- Write clean, commented code — SIH judges sometimes review code/GitHub repo, not just the demo.

## Suggested Build Order (for Codex sessions)

1. Scaffold backend (Express server + MongoDB connection + all Mongoose models)
2. Build + test Agmarknet price-fetching service with mock-fallback
3. Build price-comparison + trend-chart + net-profit-calculator endpoints and connect frontend
4. Build farmer/buyer registration + lot-creation + offer flow
5. Add LLM chatbot + voice-interface last (these are additive, won't break core-demo if incomplete)
6. Add dispute-system + mock payment-status as final polish
