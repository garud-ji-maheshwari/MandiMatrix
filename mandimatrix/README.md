# MandiMatrix

SIH26132 - Strengthening market linkages and price discovery for farmers.

MandiMatrix is a React + Vite + Tailwind web app backed by Node.js, Express,
MongoDB, and Mongoose. It helps farmers compare nearby mandi prices, calculate
net profit after transport, understand price trends, list crop lots, receive
buyer offers, and track disputes.

## Implemented

- Phase 1: backend scaffold, MongoDB connection, Mongoose models, price
  comparison endpoint, net-profit calculator, 30-day price trend endpoint,
  Recharts trend chart, and farmer registration.
- Phase 2: buyer registration, lot creation, rule-based buyer matching, digital
  offers, offer acceptance, LLM chat wrapper, and Hindi browser voice controls.
- Phase 3: dispute tracking and a mock payment status toggle. There is no real
  payment gateway integration.

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Set `MONGO_URI` in `.env` for MongoDB/Atlas. If MongoDB or Agmarknet are not
available, the backend uses demo fallback data so the app remains usable.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend uses `VITE_API_URL` when set, otherwise it calls
`http://localhost:5000/api`.

## Useful Commands

```bash
cd frontend && npm run build
cd frontend && npm run lint
cd backend && node --check server.js
```

## Project Docs

- `SPEC.md` - original feature spec, data models, API endpoints, and build order.
