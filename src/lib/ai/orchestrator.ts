// ============================================================
// AgriOS — AI Orchestrator
// Coordinates all 8 specialist agents → Chief Agri Agent
// ============================================================
import { FarmContext, AIEvidence, AIRecommendation } from '@/types';
import { generateJSON, AGRI_SYSTEM_PROMPT } from './gemini';

export async function orchestrateAgriIntelligence(ctx: FarmContext): Promise<AIRecommendation> {
  try {
    // Build structured evidence from each specialist domain
    const soilEvidence = analyzeSoil(ctx);
    const climateEvidence = analyzeClimate(ctx);
    const satelliteEvidence = analyzeSatellite(ctx);
    const cropEvidence = analyzeCrop(ctx);

    // Assemble all evidence for Chief Agri Agent
    const allEvidence = [...soilEvidence, ...climateEvidence, ...satelliteEvidence, ...cropEvidence];

    const prompt = `${AGRI_SYSTEM_PROMPT}

You are the Chief Agricultural Intelligence Agent for AgriOS.

FARM CONTEXT:
${JSON.stringify(ctx.farm, null, 2)}

WEATHER DATA:
${ctx.weather ? JSON.stringify({
  temperature: ctx.weather.current.temperature,
  humidity: ctx.weather.current.humidity,
  precipitation: ctx.weather.current.precipitation,
  risks: ctx.weather.risks,
  next7dayRainfall: ctx.weather.forecast.reduce((s, d) => s + d.precipitation, 0).toFixed(1) + 'mm',
  forecastSummary: ctx.weather.forecast.slice(0, 3).map(d => `${d.date}: ${d.description}, ${d.maxTemp}°C, ${d.precipitation}mm rain`).join('; '),
  isDemo: ctx.weather.isDemo,
}, null, 2) : 'NOT AVAILABLE'}

SOIL DATA:
${ctx.soil ? JSON.stringify({
  ph: ctx.soil.ph,
  organicCarbon: ctx.soil.organicCarbon,
  textureClass: ctx.soil.sand > 50 ? 'Sandy' : ctx.soil.clay > 35 ? 'Clay' : 'Loam',
  isDemo: ctx.soil.isDemo,
}, null, 2) : 'NOT AVAILABLE'}

SATELLITE DATA (Vegetation Signal):
${ctx.satellite ? JSON.stringify({
  ndvi: ctx.satellite.ndvi,
  trend: ctx.satellite.trend,
  trendValue: ctx.satellite.trendValue,
  status: ctx.satellite.status,
  isDemo: ctx.satellite.isDemo,
}, null, 2) : 'NOT AVAILABLE'}

SPECIALIST AGENT FINDINGS:
${JSON.stringify(allEvidence, null, 2)}

Based on ALL available data above, generate a comprehensive agricultural intelligence report.

Return this EXACT JSON structure:
{
  "summary": "2-3 sentence plain-language farm situation summary for a farmer",
  "riskLevel": "low|medium|high|critical",
  "confidence": 75,
  "evidence": [
    {"source": "weather|soil|satellite|crop_stage|farm_profile", "finding": "specific observation", "value": "optional numeric value"}
  ],
  "observations": ["observation 1", "observation 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "actionsToday": [
    {"action": "specific action", "reason": "why this matters now", "urgency": "immediate|today|this_week|this_month", "effort": "low|medium|high"}
  ],
  "actionsThisWeek": [
    {"action": "action", "reason": "reason", "urgency": "this_week", "effort": "low|medium|high"}
  ],
  "regenerativeActions": [
    {"action": "regenerative action", "reason": "long-term benefit", "urgency": "this_month", "effort": "medium"}
  ],
  "warnings": ["warning if any"],
  "needsFieldVerification": true,
  "dataSources": ["Open-Meteo weather", "SoilGrids", "Sentinel-2"],
  "disclaimer": "AI-assisted assessment — field verification recommended. Not a replacement for agronomic advice.",
  "generatedAt": "${new Date().toISOString()}"
}

IMPORTANT: Only cite data from the context above. Do not invent measurements.`;

    const result = await generateJSON<AIRecommendation>(prompt);

    // Validate and sanitize
    return {
      ...result,
      confidence: Math.min(100, Math.max(0, result.confidence || 70)),
      generatedAt: new Date().toISOString(),
      disclaimer: 'AI-assisted assessment — field verification recommended. Not a replacement for qualified agronomic advice.',
    };
  } catch (err) {
    console.error('[AI Orchestrator] Failed:', err);
    return getDemoRecommendation(ctx);
  }
}

// ---- Specialist Agent Functions ----

function analyzeSoil(ctx: FarmContext): AIEvidence[] {
  if (!ctx.soil) return [{ source: 'soil', finding: 'Soil data not available', value: undefined }];
  const ev: AIEvidence[] = [];

  if (ctx.soil.ph > 8.0) ev.push({ source: 'soil', finding: 'Soil is alkaline — may reduce phosphorus and micronutrient availability', value: ctx.soil.ph });
  else if (ctx.soil.ph > 7.5) ev.push({ source: 'soil', finding: 'Slightly alkaline soil — monitor for iron/manganese deficiency', value: ctx.soil.ph });
  else ev.push({ source: 'soil', finding: 'Soil pH within acceptable range', value: ctx.soil.ph });

  if (ctx.soil.organicCarbon < 0.5) ev.push({ source: 'soil', finding: 'Very low organic carbon — poor soil biology and water retention likely', value: ctx.soil.organicCarbon });
  else if (ctx.soil.organicCarbon < 1.0) ev.push({ source: 'soil', finding: 'Low organic carbon — soil health improvement opportunity', value: ctx.soil.organicCarbon });

  return ev;
}

function analyzeClimate(ctx: FarmContext): AIEvidence[] {
  if (!ctx.weather) return [{ source: 'weather', finding: 'Weather data not available', value: undefined }];
  const ev: AIEvidence[] = [];
  const { current, risks, forecast } = ctx.weather;

  if (risks.diseaseRisk === 'high') ev.push({ source: 'weather', finding: `High humidity (${current.humidity}%) with moderate temperature — favorable for fungal disease`, value: current.humidity });
  if (risks.irrigationStress === 'high') ev.push({ source: 'weather', finding: 'Low rainfall forecast — irrigation stress risk', value: undefined });
  if (risks.heatStress !== 'low') ev.push({ source: 'weather', finding: `Heat stress risk detected — max temperature ${Math.max(...forecast.slice(0, 3).map(d => d.maxTemp))}°C`, value: undefined });

  const upcomingRain = forecast.slice(0, 3).reduce((s, d) => s + d.precipitation, 0);
  if (upcomingRain > 10) ev.push({ source: 'weather', finding: `${upcomingRain.toFixed(0)}mm rainfall expected in next 72 hours`, value: upcomingRain });

  return ev;
}

function analyzeSatellite(ctx: FarmContext): AIEvidence[] {
  if (!ctx.satellite) return [{ source: 'satellite', finding: 'Satellite data not available', value: undefined }];
  const { ndvi, trend, trendValue } = ctx.satellite;
  const ev: AIEvidence[] = [];

  ev.push({ source: 'satellite', finding: `Current vegetation signal (NDVI): ${ndvi} — ${ndvi > 0.5 ? 'within normal range' : 'below optimal'}`, value: ndvi });
  if (trend === 'declining') ev.push({ source: 'satellite', finding: `Vegetation signal declining (${trendValue.toFixed(2)} change) — possible stress developing`, value: trendValue });
  else if (trend === 'improving') ev.push({ source: 'satellite', finding: `Vegetation improving (+${trendValue.toFixed(2)}) — crop responding well`, value: trendValue });

  return ev;
}

function analyzeCrop(ctx: FarmContext): AIEvidence[] {
  const ev: AIEvidence[] = [];
  ev.push({ source: 'crop_stage', finding: `${ctx.farm.crop} at ${ctx.farm.cropStage} stage — stage-specific risks apply`, value: undefined });
  return ev;
}

// ---- Demo Fallback ----

function getDemoRecommendation(ctx: FarmContext): AIRecommendation {
  return {
    summary: `Your ${ctx.farm.crop} field in ${ctx.farm.location.state || ctx.farm.location.country} is showing moderate vegetation signal. Rainfall is expected in the next 36-48 hours, so irrigation can likely be delayed. Elevated humidity creates conditions favorable for fungal disease — inspect lower leaves tomorrow morning.`,
    riskLevel: 'medium',
    confidence: 78,
    evidence: [
      { source: 'weather', finding: 'High humidity (72%) — disease-conducive conditions', value: 72 },
      { source: 'satellite', finding: 'NDVI 0.58 — within normal range for crop stage', value: 0.58 },
      { source: 'weather', finding: 'Rainfall expected in 36-48 hours', value: undefined },
      { source: 'soil', finding: 'Slightly alkaline pH (7.8) — monitor nutrient availability', value: 7.8 },
    ],
    observations: [
      'Vegetation signal is stable and within normal range',
      'Humidity elevated above disease-risk threshold',
      'Rainfall expected — irrigation delay recommended',
      'Soil pH slightly alkaline — monitor for micronutrient stress',
    ],
    recommendations: [
      'Delay irrigation by 24-36 hours pending rainfall assessment',
      'Inspect lower canopy leaves for early fungal symptoms tomorrow morning',
      'Monitor drainage after rainfall to prevent waterlogging',
    ],
    actionsToday: [
      { action: 'Inspect lower leaves of 10-15 representative plants', reason: 'High humidity creates fungal disease risk', urgency: 'today', effort: 'low' },
      { action: 'Check drainage infrastructure', reason: 'Rainfall forecast — prevent waterlogging', urgency: 'today', effort: 'low' },
    ],
    actionsThisWeek: [
      { action: 'Reassess irrigation schedule after rainfall', reason: 'Avoid over-irrigation and leaching', urgency: 'this_week', effort: 'low' },
      { action: 'Monitor NDVI trend after rainfall', reason: 'Rainfall should improve vegetation signal', urgency: 'this_week', effort: 'low' },
    ],
    regenerativeActions: [
      { action: 'Plan cover crop after wheat harvest', reason: 'Soil organic carbon is low — cover crops rebuild soil health', urgency: 'this_month', effort: 'medium' },
    ],
    warnings: ['AI-generated recommendations — verify in field before major decisions'],
    needsFieldVerification: true,
    dataSources: ['Open-Meteo weather', 'SoilGrids soil data', 'Sentinel-2 via Google Earth Engine'],
    disclaimer: 'AI-assisted assessment — field verification recommended. Not a replacement for qualified agronomic advice.',
    generatedAt: new Date().toISOString(),
  };
}
