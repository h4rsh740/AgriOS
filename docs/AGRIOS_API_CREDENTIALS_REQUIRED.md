# AgriOS — API & Credentials Required Tracker

Every external API, service account, and cloud credential required to move from hybrid demo/benchmark mode to 100% production live streaming is cataloged below.

---

### 1. Google Gemini AI Studio
```text
SERVICE: Google AI Studio (Gemini)
PURPOSE: Multi-agent agricultural intelligence orchestrator, conversational farmer advisor, and multimodal crop disease image investigation
CREDENTIAL REQUIRED: Gemini API Key
ENVIRONMENT VARIABLE: GEMINI_API_KEY
WHERE TO GET IT: https://aistudio.google.com/
BILLING REQUIRED: Free tier available (no billing required for standard quotas)
CURRENT STATUS: 🟢 CONFIGURED & ACTIVE in .env.local
BLOCKED FEATURE: None (Fully operational)
```

---

### 2. Google Cloud Speech-to-Text & Text-to-Speech & Translation
```text
SERVICE: Google Cloud Speech, TTS, and Translation APIs
PURPOSE: High-fidelity Hindi/English audio synthesis (Neural2) and cloud transcription for rural farmers
CREDENTIAL REQUIRED: Google Cloud API Key with Cloud Speech, Cloud Text-to-Speech, and Cloud Translation APIs enabled
ENVIRONMENT VARIABLE: GOOGLE_CLOUD_API_KEY
WHERE TO GET IT: https://console.cloud.google.com/apis/credentials
BILLING REQUIRED: Yes (Free monthly allowance: 60 min STT, 4M chars Neural2 TTS, 500k chars Translation)
CURRENT STATUS: 🟡 OPTIONAL / GRACEFUL FALLBACK (AgriOS automatically falls back to browser Web Speech API and offline agricultural lexicon)
BLOCKED FEATURE: High-fidelity Neural2 server-side audio rendering and server-side transcription
```

---

### 3. Google Maps Platform
```text
SERVICE: Google Maps Platform (JavaScript API & Places API)
PURPOSE: Interactive farm boundary picker, GPS field location confirmation, nearby APMC mandi routing
CREDENTIAL REQUIRED: Browser-restricted Google Maps API Key
ENVIRONMENT VARIABLE: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
WHERE TO GET IT: https://console.cloud.google.com/google/maps-apis/
BILLING REQUIRED: Yes ($200 recurring monthly free credit provided by Google)
CURRENT STATUS: 🟡 OPTIONAL / GRACEFUL FALLBACK (AgriOS provides interactive manual coordinate and address picker when key is absent)
BLOCKED FEATURE: Google Places autocomplete & Google satellite tiles on location picker
```

---

### 4. Google Earth Engine
```text
SERVICE: Google Earth Engine (GEE)
PURPOSE: Sentinel-2 median NDVI/NDMI multispectral computation over farm boundaries
CREDENTIAL REQUIRED: GEE Project Registration & Service Account OAuth2 token
ENVIRONMENT VARIABLE: EARTH_ENGINE_PROJECT_ID, GOOGLE_CLOUD_ACCESS_TOKEN
WHERE TO GET IT: https://earthengine.google.com/ (Non-commercial research access is free)
BILLING REQUIRED: Optional (Free tier for research & non-commercial use)
CURRENT STATUS: 🟡 REST CLIENT CONFIGURED (Falls back honestly to Sentinel-2 representative 8-week historical trend)
BLOCKED FEATURE: Real-time dynamic polygon reduction over arbitrary custom boundary coordinates
```

---

### 5. data.gov.in (Open Government Data - Agmarknet)
```text
SERVICE: data.gov.in (National Data Sharing and Accessibility Portal)
PURPOSE: Live daily APMC Mandi commodity arrival prices for wheat, paddy, mustard, soybean, cotton
CREDENTIAL REQUIRED: data.gov.in API Key
ENVIRONMENT VARIABLE: DATA_GOV_IN_API_KEY
WHERE TO GET IT: https://data.gov.in/ (Instant free registration for Indian citizens & developers)
BILLING REQUIRED: No (100% Free Public Digital Good)
CURRENT STATUS: 🟢 CONFIGURED & VERIFIED LIVE in .env.local (Live Agmarknet streaming verified)
BLOCKED FEATURE: None (Live commodity arrival data active)
```

---

### 6. Firebase (Authentication & Cloud Firestore)
```text
SERVICE: Firebase (Google Cloud)
PURPOSE: Multi-tenant farmer authentication, persistent farm profiles, digital twin observation snapshots, disease logs, and action items
CREDENTIAL REQUIRED: Firebase Web App Configuration (API Key, Project ID, Auth Domain, Storage Bucket)
ENVIRONMENT VARIABLE: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
WHERE TO GET IT: https://console.firebase.google.com/ > Project Settings > General > Your apps
BILLING REQUIRED: No (Free Spark plan)
CURRENT STATUS: 🟡 CLIENT READY (Full Firestore write/read architecture + local caching handles offline/unconfigured sessions)
BLOCKED FEATURE: Cross-device multi-phone synchronization without local cache
```

---

### 7. Google Cloud Vertex AI (Predictive ML)
```text
SERVICE: Google Cloud Vertex AI
PURPOSE: Serving Tabular AutoML yield prediction and agro-climatic risk models
CREDENTIAL REQUIRED: Vertex AI Prediction Endpoint ID & Google Cloud Access Token
ENVIRONMENT VARIABLE: VERTEX_AI_YIELD_ENDPOINT_ID, GOOGLE_CLOUD_PROJECT_ID
WHERE TO GET IT: https://console.cloud.google.com/vertex-ai/endpoints
BILLING REQUIRED: Yes (Vertex AI prediction pricing)
CURRENT STATUS: 🟡 INTERFACE IMPLEMENTED (Clear separation from LLMs; ICAR/FAO statistical baseline active)
BLOCKED FEATURE: Custom AutoML trained model weight inference
```
