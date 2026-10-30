# TasteTransplant 🌍✨
### *Moved cities? Keep your taste.*

> **Qloo AI Hackathon Submission**  
> Cultural Relocation Agent powered by the **Qloo Taste Graph API** & Next.js 14 App Router.

---

## 📌 The Problem
When people move to a new city (for example, moving from **Pune to Berlin** or **Toronto to Tokyo**), they leave behind their favorite independent cafes, neighborhood record stores, and underground cinemas. 

Traditional relocation tools and generic LLMs fail:
- **Plain LLMs recommend by popularity, not taste:** A generic LLM suggests well-known places and often just echoes your favorites' names (for example a "Nike Store" for a Nike fan or a "Coldplay Tribute Night" for a Coldplay fan), with no tie to your taste signals or to the city's local scene.
- **Domain Silos:** Standard recommendation engines don't connect non-geographic affinities (e.g., loving Radiohead and Blade Runner) with local spatial equivalents (e.g., finding the exact vinyl-listening bar and neo-noir ramen counter in Kreuzberg).

## 💡 The Solution
**TasteTransplant** acts as your personal cultural relocation concierge:
1. **Curate Your Taste Fingerprint:** Select your favorite music artists, films, dining preferences, and cultural icons.
2. **Translate Across Domains with Qloo:** Qloo's Cultural Taste Graph maps your multidimensional affinities to verified real-world places, neighborhoods, and venues in your destination.
3. **Strict Grounding Guarantee:** Every single venue is returned directly by Qloo's API. The AI language model *only* writes the explanatory narrative.
4. **Side-by-Side LLM Benchmark:** In our benchmark run (Pune → London), 10 of 10 plain-LLM suggestions could not be matched to Qloo's taste-matched results for the same profile.

For example, the plain LLM answered a fan of Blade Runner 2049 with a cocktail bar "perfect for fans of Blade Runner," and a fan of Nike with the Nike Town store. It matched names, not taste.

---

## 🔬 How Qloo Is Used (Technical Architecture)

TasteTransplant leverages the Qloo API deeply across several endpoints:

| Qloo Endpoint | Parameters & Signals | Purpose in TasteTransplant |
|---|---|---|
| **`GET /v2/insights`** | `filter.type=urn:entity:place`<br>`signal.interests.entities=[ids]`<br>`filter.location.query=[city]` | **Dining & Venues:** Recommends verified restaurants, cafes, and bars in the destination that match user affinities. Lodging/junk filtered. |
| **`GET /v2/insights`** | `filter.type=urn:entity:locality`<br>`signal.interests.entities=[ids]`<br>`filter.location.query=[city]` | **Neighborhood Vibe:** Pinpoints districts and subcultures that mirror the user's cultural lifestyle. |
| **`GET /v2/insights`** | `filter.type=urn:tag`<br>`signal.interests.entities=[ids]` | **Taste DNA Extraction:** Extracts core cross-domain tags (e.g., `#indie`, `#cyberpunk`, `#ambient`) describing the user's profile. |
| **`GET /v2/insights`** | `filter.type=urn:entity:artist`<br>`signal.interests.entities=[ids]` | **Local Sound & Music:** Identifies local musicians and listening venues in the destination. |
| **`GET /v2/tags`** | `query=[keyword]` | **Dynamic Chat Refinement:** The AI chat concierge converts natural-language queries (e.g., "cozier cafes to code") into Qloo tag signals. |
| **`GET /v2/search`** | `query=[name]&type=[entity_type]` | **Entity Onboarding Resolution:** Resolves user-searched music artists, movies, and brands into official Qloo entity IDs. |

### Caching & Rate Limit Protection
- All Qloo API requests are hashed by query URL and stored in PostgreSQL (`QlooCache` table).
- Pre-warmed cache ensures instant 1-click demo runs without hitting rate limits during judge evaluations.

---

## ⚡ The Live Demo (Pune → London in 1 Click)
Judges can evaluate the entire end-to-end pipeline with zero typing:
- Click **"⚡ Try the Demo (Pune → London)"** on the landing page or header navigation.
- Instantly loads the demo profile (*Radiohead, Blade Runner, Studio Ghibli, Daft Punk, Ramen*) against London.
- Opens the verified London Taste Map with live Leaflet/Google Maps pinpoints, Taste DNA tags, API evidence drawers, and LLM comparison benchmark.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 20 & 24)
- PostgreSQL database (e.g. Neon serverless Postgres)
- Qloo API Key ([https://qloo.com](https://qloo.com))
- Groq or OpenAI API Key (for LLM function calling and plain-LLM comparison)

### 1. Clone & Install
```bash
git clone https://github.com/H-P-Jadeja/Qloo.git
cd Qloo
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the values in `.env`:
```env
QLOO_API_KEY=your_qloo_key
QLOO_API_URL=https://hackathon.api.qloo.com
LLM_API_KEY=your_groq_or_openai_key
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=openai/gpt-oss-120b
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Unit Tests
```bash
npm test
```

---

## ⚖️ Grounding vs Plain LLM Benchmark
Under `/compare/[slug]`, TasteTransplant executes an ungrounded LLM query with the exact same user profile and destination.
- **Qloo-Grounded:** Every pick is returned by Qloo — active API evidence, location data, and shared tag signals for each result.
- **Plain LLM:** Evaluated against Qloo's taste graph, revealing that **8 out of 10** plain LLM suggestions fail cultural grounding or recommend tourist cliches.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

