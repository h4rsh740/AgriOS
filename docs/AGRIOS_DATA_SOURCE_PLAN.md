# AgriOS — Data Source Plan

| Source | Purpose in AgriOS | Integration point | Auth | Frequency | Attribution | Status |
|---|---|---|---|---|---|---|
| Open-Meteo | Primary weather + 7-day forecast + risk heuristics | `lib/weather/openmeteo.ts` ✅ | none | 15-min cache | "Open-Meteo" shown in UI ✅ | 🟢 keep |
| SoilGrids (ISRIC) | pH, SOC, texture, bulk density | `lib/soil/soilgrids.ts` ⚠️ | none | 1-h cache | "SoilGrids" in UI | ⚠️ fix empty-`layers` handling → honest demo fallback |
| data.gov.in (Agmarknet) | Mandi prices → Market Agent, price card, trend model | NEW `/api/market/prices` | free API key | 12-h cache | "data.gov.in / Agmarknet" | 🔴 needs key |
| data.gov.in (schemes) | Scheme Agent corpus (PM-KISAN, PMFBY, KCC, Soil Health Card…) | seeded JSON first → live API later | free key | monthly | source link per scheme | 🔴 needs key |
| IMD | India-official warnings where accessible | adapter stub; Open-Meteo stays primary (no stable public IMD API) | none stable | daily attempt | "IMD" label when used | 🔴 stub, non-blocking |
| FAO (FAOSTAT/GAEZ) | Yield/suitability training data | manual load → BigQuery (P2) | none | static | FAO | 🔴 P2 |
| WHO | Heat-health thresholds → climate-resilience scoring | static constants + attribution | none | static | WHO | 🟡 trivial |
| ISRO/Bhuvan | Complementary WMS satellite overlay | map tile layer (P3) | none | tiles | "Bhuvan/ISRO" | 🔴 P3 |
| PlantVillage | Disease-model evaluation set | offline eval script (P3) | none | static | cite | 🔴 P3 |

## Rules
- Every external slice carries `source` + `isDemo` fields surfaced in UI.
- No fabricated "live" values (SoilGrids bug is the canonical violation — being fixed in P0).
- Features without credentials stay clearly labeled demo; nothing silently skipped.
