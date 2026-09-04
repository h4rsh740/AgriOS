# AgriOS — Google Technology Plan

Depth today: **31/100**. Target after P0/P1: **~65/100**.

## Implemented (real)
| Tech | Where | Depth | Notes |
|---|---|---|---|
| Gemini API | `lib/ai/gemini.ts`, `/api/ai/advisor`, `/api/disease`, `/api/regenerative/roadmap` | 5/10 | JSON-mode, Vision, safety system prompt. Fix: server-built context, honest failures. |
| Maps Platform | `lib/maps/mapsClient.ts`, `FarmLocationPicker` | 3/10 | Embed + key-gated Places. Next: boundary polygon, nearby mandis. Needs key. |
| Firebase Auth | `lib/firebase/*` | 6/10 | Real, production-grade. |
| Firestore | `lib/firebase/firestore.ts` | 3/10 | Write path real; read/persist loop dead. P0 wires it. |

## Planned
| Tech | Priority | Plan |
|---|---|---|
| Earth Engine | P0-adjacent (needs credentials) | Service-account OAuth → `v1beta value:compute` Sentinel-2 median NDVI/NDMI over farm boundary → 8-week series → `satellite_observations`. Labeled demo fallback retained. |
| Cloud Speech-to-Text | P1 | `/api/voice/stt` (hi-IN, en-IN), VoiceButton component, Web Speech API fallback. |
| Cloud Text-to-Speech | P1 | `/api/voice/tts` Neural2 hi-IN → audio blob → player. |
| Cloud Translation | P1 | `/api/translate` + hi/en dictionaries; language in onboarding/profile. |
| Cloud Run | P1 | Deploy target for Next.js app (Dockerfile), Gemini keys server-side. |
| Cloud Functions | P1 | Scheduled daily weather refresh + alert generation; Firestore triggers for alerts. |
| BigQuery | P2 | Agmarknet price history + IMD historical; BQML price-trend model; scheduled export. |
| Vertex AI | P2 | AutoML price/yield models ONLY with real datasets (FAO/Agmarknet). Gemini-prompted predictions are never presented as ML. |
| Vertex AI Vision | P3 | Deferred — Gemini Vision covers MVP; no trained classifier dataset yet. |
| Dialogflow | ❌ excluded | Orchestrator covers routing; second brain adds cost without value. |

## Deliberately excluded (would be superficial)
Dialogflow · Vertex AI Vision (pre-data) · Supabase/Postgres (duplicate store) · per-agent LLM fan-out (cost without accuracy).
