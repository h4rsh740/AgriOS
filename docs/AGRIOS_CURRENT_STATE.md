# AgriOS — Current State Audit (2026-09)

Verified by full repository trace: every page, API route, service, auth flow, and external API (Gemini/Open-Meteo/SoilGrids/GEE live-tested).

## Architecture (as-built)

```
Farmer ──> Next.js 16 App Router (17 routes)
  ├─ Firebase Auth (client SDK) ................ REAL
  ├─ AppShell client-side guard ................ bypassable, no middleware
  ├─ onboarding → createFarm() ................. REAL Firestore write
  ├─ useFarmContext (client hook) .............. BROKEN: POSTs to GET-only routes → 405 → always demo
  │      └─ ignores Firestore: real farms render as demo
  ├─ AI pages → /api/ai/* → Gemini ............. REAL model, DEMO context
  │      └─ any failure → hardcoded fake → HTTP 200 → UI badge "Live" (dishonest)
  ├─ dashboard / weather / soil / satellite / regenerative pages → DEMO_* constants (no fetch)
  ├─ lib/firebase/firestore.ts ................. ~80% dead code (never called)
  ├─ lib/ai/farmContext.ts (server builder) .... correct, but imported by nothing
  └─ Firebase Storage .......................... initialized, zero usage
```

## Verified Facts

| Check | Result |
|---|---|
| `next build` / tsc / eslint | ✅ exit 0, clean |
| Gemini key (`gemini-3.6-flash`) | ✅ live HTTP 200 |
| Open-Meteo | ✅ live real data |
| SoilGrids (exact app query) | ⚠️ 200 but `layers: []` → app silently substitutes defaults labeled `isDemo:false` |
| Earth Engine | ❌ stub: `void script; return null` |
| Tests | ❌ none exist |
| firestore.rules / firebase.json | ❌ absent from repo |
| Secrets | ✅ none committed (`.env.local` gitignored) |

## Feature Status

🟢 Auth · onboarding→farm creation · Maps location picking · landing page
⚠️ Advisor · disease · roadmap · digital twin · weather · soil (broken wiring or dishonest fallbacks)
🟣 Mocked: dashboard, satellite page, what-if (constants), AgriMesh, all AI failure fallbacks
🔴 Missing: farm list/selection, settings page, Storage loop, persistence loop, voice, translation, market, schemes, alerts generation, Vertex AI, BigQuery, deploy config, tests

## Completion

Frontend 55% · Backend 35% · Database 30% · AI 45% · ML 0% · Google Tech 31/100 · Public Data 10% · Production 30% · **Overall 38%**

## Top Problems (ranked)

1. `useFarmContext` POST→GET-only-routes mismatch — no AI feature receives live data
2. Real farms invisible (hook + dashboard ignore Firestore)
3. AI/data endpoints unauthenticated, unthrottled (quota abuse)
4. SoilGrids empty response fabricated as "live" values
5. AI failures returned as HTTP 200 and labeled "Live"
6. GEE stub (P0 spec pillar)
7. Persistence loop dead (nothing saved/reused)
8. Dashboard diorama + `/farm` and `/settings` 404s
9. Disease page sends hardcoded context; images never stored
10. No rules-as-code, no tests, no deploy config
