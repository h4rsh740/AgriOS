# AgriOS — Public & Agricultural Data Matrix

This matrix documents authoritative public agricultural datasets integrated into AgriOS, their frequency, attribution, and verification status.

| Dataset / Provider | Purpose in AgriOS | Integration Point | Freshness | Source Attribution | Verification Status |
|---|---|---|---|---|---|
| **Open-Meteo** | Hourly temperature, humidity, wind, 7-day precipitation forecast & meteorological risks | `lib/weather/openmeteo.ts`, `lib/services/agriculture/weatherService.ts`, `/api/weather` | 15-minute cache | *"Open-Meteo"* displayed in UI | 🟢 Fully Live (Free tier, no key required, tested) |
| **SoilGrids (ISRIC)** | 0-30cm soil pH, organic carbon (SOC), sand/silt/clay texture, bulk density | `lib/soil/soilgrids.ts`, `/api/soil`, `/farm/[id]/soil` | 1-hour cache | *"SoilGrids REST API (ISRIC)"* | 🟢 Verified & Fixed (No false live claims; honest demo fallback when `layers: []`) |
| **data.gov.in (Agmarknet)** | Daily APMC Mandi commodity arrival prices (min, max, modal per quintal) | `lib/services/agriculture/marketService.ts`, `/api/market/prices` | 12-hour cache | *"data.gov.in / Agmarknet (Ministry of Agriculture)"* | 🟢 Integrated (Active API query with `DATA_GOV_IN_API_KEY` + benchmark dataset) |
| **Indian Government Schemes** | PM-KISAN, PMFBY, KCC, Soil Health Card, PKVY, PMKSY eligibility matching | `lib/services/agriculture/schemeService.ts`, `/api/schemes` | Monthly catalog | *"National Portal of India / DA&FW"* | 🟢 Fully Live (Deterministic farmer eligibility matching engine) |
| **IMD (India Meteorological Department)** | Gramin Krishi Mausam Sewa agromet advisory bulletins | `lib/services/agriculture/weatherService.ts` | Daily bulletin | *"IMD Agromet Advisory Service"* | 🟢 Adapter Interface Active |
| **ICAR & FAOSTAT** | Crop phenology norms, critical irrigation stages, baseline yield metrics | `lib/services/agriculture/cropService.ts`, `lib/services/agriculture/vertexService.ts` | Annual release | *"ICAR / FAOSTAT Agricultural Statistics"* | 🟢 Agronomic Knowledge Base Active |
| **Sentinel-2 (Copernicus)** | 10-meter multispectral surface reflectance & 8-week NDVI trend | `lib/satellite/earthengine.ts`, `/api/satellite` | 5-day revisit | *"Sentinel-2 via Google Earth Engine"* | 🟢 Active GEE REST Client + Benchmark Trend |
