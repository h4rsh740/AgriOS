# 🌱 AgriOS

**"The Open Intelligence Layer for Regenerative Agriculture"**

> *Sense. Understand. Simulate. Act. Learn. Share.*

AgriOS gives every farm a **Digital Twin** — powered by Gemini AI, real satellite data, and free open APIs. Built for the Google BRICS Hackathon.

---

## 🚀 Live Demo

```
npm install && npm run dev
# → http://localhost:3000
# No API keys required for core demo
```

---

## 🧠 What It Does

| Pillar | Feature |
|--------|---------|
| **Sense** | Weather (Open-Meteo), Soil (SoilGrids), Satellite NDVI (Google Earth Engine) |
| **Understand** | 8-agent Gemini AI orchestrator — evidence trail on every recommendation |
| **Simulate** | What-If engine — compare 3 scenarios before making field decisions |
| **Act** | 90-day regenerative roadmap with checkable daily/weekly actions |
| **Learn** | AgriMesh — BRICS federated farm intelligence network |
| **Share** | Sovereign data architecture — raw farm data never leaves your environment |

---

## 🏗️ Architecture

```
Next.js 14 (App Router)
├── /app/farm/[id]/*     ← 9 farm intelligence pages
├── /app/api/*           ← 9 server-side API routes
├── /lib/ai/             ← Gemini orchestrator + 8 domain agents
├── /lib/weather/        ← Open-Meteo (free, no key)
├── /lib/soil/           ← SoilGrids WCS (free, no key)
├── /lib/satellite/      ← Google Earth Engine NDVI
├── /lib/simulation/     ← What-If scenario engine
└── /lib/regenerative/   ← Score calculator + roadmap
```

## 📊 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Farm overview + alerts |
| `/farm/[id]` | Digital Twin hub |
| `/farm/[id]/weather` | 7-day forecast + risk cards |
| `/farm/[id]/satellite` | NDVI trend + health zones |
| `/farm/[id]/soil` | pH, SOC, texture radar |
| `/farm/[id]/disease` | AI photo analysis (Gemini multimodal) |
| `/farm/[id]/advisor` | 8-agent AI recommendation + evidence |
| `/farm/[id]/simulate` | What-If 3-scenario comparison |
| `/farm/[id]/regenerative` | 7-category regen score |
| `/farm/[id]/roadmap` | 90-day checkable plan |
| `/agrimesh` | BRICS federated network |

---

## ⚡ Stack and Cost

| Service | Purpose | Cost |
|---------|---------|------|
| **Next.js 14** | Full-stack framework | Free |
| **Gemini 2.0 Flash** | AI orchestration | Free tier |
| **Firebase** | Auth + Firestore | Free Spark plan |
| **Open-Meteo** | Weather API | **Free, no key** |
| **SoilGrids** | Soil data API | **Free, no key** |
| **Google Earth Engine** | NDVI satellite | Free for research |
| **Vercel** | Deployment | Free hobby |

**Total production cost: Rs. 0**

---

## 🔧 Setup

```bash
git clone https://github.com/h4rsh740/AgriOS
cd AgriOS
npm install

# Optional: copy env template and add API keys
cp .env.example .env.local
# GEMINI_API_KEY=your_key   <- for live AI features
# (all other services work without keys)

npm run dev
```

---

## 🎯 Safety and Trust

Every AI output includes:
- **Confidence %** — never fabricates certainty
- **Evidence trail** — every claim linked to a data source
- **Field verification required** — clear disclaimers throughout
- **isDemo: true** labeling — demo data is never presented as live

---

## 📄 License


MIT —  open source by design. AgriOS is public digital infrastructure.

---

*Built for the Google BRICS Hackathon 2026*
