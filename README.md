# 🌱 AgriOS — AI-Powered Digital Public Infrastructure for Indian Agriculture

> **Build with AI: Code for Communities — Second Edition**
> Powered by Google Cloud · Firebase · Gemini AI · Vertex AI

**"The Open Intelligence Layer for Regenerative Agriculture"**

*Sense. Understand. Simulate. Act. Learn. Share.*

AgriOS gives every Indian farmer a **Farm Digital Twin** — an AI-powered intelligence platform built on Google's GenAI stack. Designed for India's 140 million farmers, AgriOS addresses the four pillars of community impact: **Resilience, Sustainability, Innovation, and Cooperation**.

---

## 🏆 Hackathon Track

**Track:** AI for Digital Public Infrastructure & Governance
**Secondary Theme:** Clean Air & Climate Resilience

AgriOS is an AI-powered solution for Digital Public Infrastructure — improving public agricultural services, citizen experiences, and digital governance for India's farming communities.

---

## 🎯 Four Community Pillars

### 🛡️ Resilience
AgriOS helps farming communities **prepare for, withstand, and recover from shocks**:
- Real-time extreme weather alerts (heat stress, frost, monsoon flooding)
- AI-predicted pest & fungal disease outbreaks before they spread
- 90-day regenerative action roadmap with contingency planning
- Crop failure risk scoring based on live satellite NDVI + weather telemetry

### 🌍 Sustainability
AgriOS solves long-term environmental and resource challenges:
- **Regenerative Agriculture Score** — tracks 7 soil & ecosystem health dimensions
- Water-use optimization through irrigation scheduling tied to 3-day rainfall forecasts
- Soil organic carbon (SOC) monitoring via SoilGrids (prevents desertification)
- Promotes transition from chemical to regenerative farming practices

### ⚡ Innovation
AgriOS leverages emerging technology to solve real-world problems in new ways:
- **8-agent Gemini AI orchestrator** — multi-agent reasoning with evidence trails
- **Satellite NDVI** via Google Earth Engine — 10m Sentinel-2 resolution crop health
- **Federated AgriMesh** — BRICS sovereign farm intelligence network (privacy-preserving)
- **Gemini Multimodal** — crop disease detection from smartphone photos
- **What-If Simulation Engine** — AI scenario comparison before field decisions

### 🤝 Cooperation
AgriOS connects communities, NGOs, governments, and farmers:
- **Government scheme matching** — auto-matches farmers to PM-KISAN, PMFBY, subsidies
- **AgriMesh BRICS Network** — federated intelligence shared across India, Brazil, South Africa, China, Russia, UAE
- **Bilingual UI (Hindi + English)** — digital inclusion for rural, non-literate communities
- **Voice Assistant** — farmers interact in Hindi by speaking, not typing

---

## 🌐 Impact at Scale

| Metric | Value |
|--------|-------|
| Target users | 140 million Indian farmers |
| Languages | Hindi + English (more planned) |
| Agro-climatic zones covered | All 15 ICAR zones |
| APIs integrated | 8 live data sources |
| Cost to farmer | ₹0 (100% free) |
| Deployment cost | ₹0 (Vercel free tier) |

---

## 🤖 Google GenAI Technology Stack

| Technology | How AgriOS Uses It |
|---|---|
| **Gemini 2.5 Flash (Vertex AI)** | 8-agent AI orchestrator: weather agent, soil agent, disease agent, market agent, scheme agent, regenerative agent, simulation agent, chief advisor |
| **Gemini Multimodal** | Crop disease photo analysis — upload a leaf photo, get AI diagnosis |
| **Firebase Authentication** | Secure farmer login with Google Sign-In |
| **Firebase Firestore** | Farm data storage, user profiles, alert history |
| **Google Earth Engine** | Satellite NDVI imagery (10m Sentinel-2 resolution) |
| **Google Maps Platform** | Farm location picker with agro-climatic zone detection |
| **Google Cloud (Serverless)** | All backend API routes run as serverless functions |
| **Google BigQuery** | Historical Mandi APMC price analytics |

> Built using **Gemini Code Assist** during development for accelerated AI-assisted coding.

---

## 🧠 What It Does

| Module | Description |
|--------|-------------|
| **🌦️ Sense** | Open-Meteo weather, SoilGrids soil chemistry, Google Earth Engine NDVI |
| **🤖 Understand** | 8-agent Gemini AI with confidence %, evidence trail, contradiction detection |
| **🔁 Simulate** | What-If engine — compare 3 farming scenarios before making decisions |
| **📋 Act** | 90-day regenerative roadmap with daily/weekly checkable actions |
| **📊 Learn** | AgriMesh federated BRICS farm intelligence network |
| **🔒 Share** | Sovereign data — raw farm data never leaves your environment |

---

## 🏗️ Architecture

```
AgriOS (Next.js 14 — Serverless on Vercel / Google Cloud)
├── Frontend (React)                  → Vercel Edge Network
└── Backend (Next.js API Routes)      → Serverless Functions
    ├── /api/ai/           (Gemini multi-agent orchestrator)
    ├── /api/weather/      (Open-Meteo real-time telemetry)
    ├── /api/satellite/    (Google Earth Engine NDVI)
    ├── /api/market/       (data.gov.in Mandi APMC prices)
    ├── /api/schemes/      (Government scheme matching engine)
    ├── /api/disease/      (Gemini multimodal crop diagnosis)
    ├── /api/soil/         (SoilGrids WCS soil chemistry)
    ├── /api/alerts/       (Real-time farm alert engine)
    └── /api/voice/        (Hindi voice assistant)

External Google Services
├── Gemini 2.5 Flash (Vertex AI)      → AI intelligence
├── Firebase Auth + Firestore          → User data
├── Google Earth Engine                → Satellite NDVI
├── Google Maps Platform               → Farm geolocation
└── Google BigQuery                    → Price analytics
```

---

## 📊 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing — AgriOS overview |
| `/dashboard` | Farmer Command Center — all metrics at a glance |
| `/farm/[id]` | Farm Digital Twin hub |
| `/farm/[id]/weather` | 7-day forecast + heat stress / disease risk cards |
| `/farm/[id]/satellite` | NDVI trend + canopy health zones |
| `/farm/[id]/soil` | pH, SOC, texture — ISRIC SoilGrids data |
| `/farm/[id]/disease` | AI photo analysis — Gemini multimodal diagnosis |
| `/farm/[id]/advisor` | 8-agent AI recommendation + full evidence trail |
| `/farm/[id]/simulate` | What-If 3-scenario comparison engine |
| `/farm/[id]/regenerative` | 7-category regenerative agriculture score |
| `/farm/[id]/roadmap` | 90-day AI regenerative action plan |
| `/agrimesh` | BRICS federated sovereign intelligence network |
| `/settings` | Language (Hindi/English), notifications, profile |

---

## 🌿 Sustainability & Real-World Impact

AgriOS directly addresses **UN SDG Goals**:
- **SDG 2 (Zero Hunger)** — AI-optimized crop decisions increase yield
- **SDG 13 (Climate Action)** — Regenerative farming reduces carbon footprint
- **SDG 15 (Life on Land)** — Soil health monitoring prevents land degradation
- **SDG 1 (No Poverty)** — Market price intelligence prevents exploitation by middlemen
- **SDG 9 (Industry & Innovation)** — Digital infrastructure for India's rural economy
- **SDG 17 (Partnerships)** — BRICS cooperation network for knowledge exchange

**Farmer Suicide Crisis**: India loses ~10,000 farmers per year to debt-driven suicide. AgriOS addresses root causes — crop failure prediction, market price access, government scheme awareness — providing data-backed decisions that directly reduce financial risk.

---

## ⚡ Zero-Cost Production Stack

| Service | Purpose | Cost |
|---------|---------|------|
| **Next.js 14** | Full-stack framework | Free |
| **Gemini 2.5 Flash** | AI orchestration (Vertex AI) | Free tier |
| **Firebase Auth + Firestore** | Authentication + database | Free Spark plan |
| **Open-Meteo** | Real-time weather API | **Free, no key** |
| **SoilGrids (ISRIC)** | Soil chemistry API | **Free, no key** |
| **Google Earth Engine** | NDVI satellite imagery | Free for research |
| **data.gov.in / Agmarknet** | Mandi APMC price data | **Free, open government data** |
| **Vercel** | Deployment + serverless | Free hobby tier |

**Total production cost: ₹0** — AgriOS is free public digital infrastructure.

---

## 🔧 Setup & Run

```bash
git clone https://github.com/h4rsh740/AgriOS
cd AgriOS/agriosmvp
npm install

# Optional: add API keys for live features
cp .env.example .env.local
# GEMINI_API_KEY=your_key_from_aistudio.google.com
# (all other services work without keys in demo mode)

npm run dev
# → http://localhost:3000
```

**No API keys required for core demo** — all critical paths have intelligent demo fallbacks.

---

## 🔐 AI Safety & Trust

Every AI output in AgriOS includes:
- **Confidence %** — never fabricates certainty
- **Evidence trail** — every recommendation linked to a real data source
- **Contradiction detection** — flags when sensors disagree
- **Field verification prompts** — clear disclaimers for major decisions
- **`isDemo: true` labeling** — demo data is never presented as live telemetry

---

## 🌐 Digital Inclusion

- **Bilingual (Hindi + English)** — full UI translation, all labels, all dropdowns, all content
- **Voice Assistant** — farmers speak in Hindi, no typing required
- **Low-bandwidth design** — works on 2G/3G rural networks
- **Mobile-responsive** — designed for ₹5,000 Android smartphones

---

## 📄 License

MIT — open source by design.

AgriOS is **public digital infrastructure** — free for farmers, NGOs, state governments, and agricultural research institutions.

---

> **Built for Build with AI: Code for Communities — Second Edition**
> Powered by **Google Cloud · Gemini AI · Firebase · Vertex AI · Google Earth Engine**
> Track: **AI for Digital Public Infrastructure & Governance**
> Pillars: **Resilience · Sustainability · Innovation · Cooperation**
