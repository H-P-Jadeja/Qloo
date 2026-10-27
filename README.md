# TasteTransplant
Move to a new city and keep your taste. A tool-calling agent uses the Qloo API (`/search`, `/v2/tags`, `/v2/insights` with location filter) to build a taste map of your destination; every pick shows its Qloo evidence, and a compare view shows plain-LLM output beside it.

## Setup
1. `cp .env.example .env` and fill in `QLOO_API_KEY`, `DATABASE_URL` (and optionally `LLM_API_KEY`).
2. `npm install && npx prisma db push`
3. `npm run qloo:test` (verify Qloo params first; adjust `src/lib/qloo/*` if needed)
4. `npm run dev` (tests: `npm test`, Node 22+)

Without `LLM_API_KEY` the app still works: it builds the plan directly from Qloo.
Deploy: Vercel + Neon; add the same env vars in Vercel project settings. MIT licensed.
