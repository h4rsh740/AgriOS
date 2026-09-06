// ============================================================
// AgriOS — Modular AI Agent System & Orchestrator
// Coordinates 9 domain agents + Chief Agricultural Orchestrator
// Powered by Google Gemini with strict structured output & safety
// ============================================================
import type { FarmContext, AIEvidence, AIRecommendation } from '@/types';
import { generateJSON, generateText, AGRI_SYSTEM_PROMPT } from './gemini';
import { getCropAgronomy } from '../services/agriculture/cropService';
import { matchFarmerSchemes } from '../services/agriculture/schemeService';

// ============================================================
// 1. DOMAIN AGENTS
// ============================================================

/** Agent 1: Crop Intelligence Agent */
export function runCropIntelligenceAgent(ctx: FarmContext): AIEvidence[] {
  const ev: AIEvidence[] = [];
  const agronomy = getCropAgronomy(ctx.farm.crop);

  ev.push({
    source: 'crop_stage',
    finding: `${ctx.farm.crop} is currently at '${ctx.farm.cropStage.replace('_', ' ')}' stage. Season: ${agronomy.season}.`,
  });

  if (agronomy.criticalStagesForIrrigation.includes(ctx.farm.cropStage)) {
    ev.push({
      source: 'crop_stage',
      finding: `Critical irrigation stage detected for ${ctx.farm.crop}. Water stress now will permanently impact yield.`,
    });
  }

  return ev;
}

/** Agent 2: Weather & Agricultural Risk Agent */
export function runWeatherAgent(ctx: FarmContext): AIEvidence[] {
  if (!ctx.weather) return [{ source: 'weather', finding: 'Live weather telemetry not currently available.' }];
  const ev: AIEvidence[] = [];
  const { current, risks, forecast } = ctx.weather;

  if (risks.diseaseRisk === 'high' || risks.diseaseRisk === 'critical') {
    ev.push({
      source: 'weather',
      finding: `High humidity (${current.humidity}%) combined with temperature (${current.temperature}°C) creates high microclimate fungal disease pressure.`,
      value: current.humidity,
    });
  }

  if (risks.heatStress !== 'low') {
    ev.push({
      source: 'weather',
      finding: `Heat stress warning: peak daytime temperatures projected to reach ${Math.max(...forecast.slice(0, 3).map(d => d.maxTemp))}°C.`,
    });
  }

  const upcomingRain = forecast.slice(0, 3).reduce((s, d) => s + d.precipitation, 0);
  if (upcomingRain > 5) {
    ev.push({
      source: 'weather',
      finding: `${upcomingRain.toFixed(1)}mm rainfall anticipated within the next 72 hours. Irrigation delay recommended to save water and avoid root waterlogging.`,
      value: upcomingRain,
    });
  }

  return ev;
}

/** Agent 3: Soil Health Agent */
export function runSoilHealthAgent(ctx: FarmContext): AIEvidence[] {
  if (!ctx.soil) return [{ source: 'soil', finding: 'Soil profile data not available for this coordinate.' }];
  const ev: AIEvidence[] = [];

  if (ctx.soil.ph > 7.8) {
    ev.push({
      source: 'soil',
      finding: `Soil is moderately alkaline (pH ${ctx.soil.ph}). May induce micronutrient chlorosis (zinc, iron) in ${ctx.farm.crop}.`,
      value: ctx.soil.ph,
    });
  } else if (ctx.soil.ph < 6.0) {
    ev.push({
      source: 'soil',
      finding: `Soil is moderately acidic (pH ${ctx.soil.ph}). Phosphorus fixation risk.`,
      value: ctx.soil.ph,
    });
  }

  if (ctx.soil.organicCarbon < 0.75) {
    ev.push({
      source: 'soil',
      finding: `Soil Organic Carbon is low (${ctx.soil.organicCarbon} g/kg). Biological activity and moisture retention capacity are constrained.`,
      value: ctx.soil.organicCarbon,
    });
  }

  return ev;
}

/** Agent 4: Geospatial & Earth Engine Agent */
export function runGeospatialAgent(ctx: FarmContext): AIEvidence[] {
  if (!ctx.satellite) return [{ source: 'satellite', finding: 'Satellite vegetation signal not available.' }];
  const { ndvi, trend, trendValue, status } = ctx.satellite;
  const ev: AIEvidence[] = [];

  ev.push({
    source: 'satellite',
    finding: `Sentinel-2 NDVI is ${ndvi.toFixed(2)} (${status.replace('_', ' ')}). 7-day trend is ${trend} (${trendValue >= 0 ? '+' : ''}${trendValue.toFixed(2)}).`,
    value: ndvi,
  });

  if (trend === 'declining' && Math.abs(trendValue) > 0.03) {
    ev.push({
      source: 'satellite',
      finding: 'Notable drop in canopy vegetative vigor detected by satellite across recent observation intervals.',
    });
  }

  return ev;
}

/** Agent 5: Government Scheme Agent */
export function runSchemeAgent(ctx: FarmContext): AIEvidence[] {
  const schemes = matchFarmerSchemes(ctx.farm);
  const eligible = schemes.filter(s => s.isEligible);
  return eligible.slice(0, 2).map(s => ({
    source: 'farm_profile',
    finding: `Eligible for ${s.name} (${s.officialTitle}): ${s.matchReason}`,
  }));
}

// ============================================================
// 2. SENSOR CONTRADICTION & DISPUTE DETECTION
// ============================================================

export { detectSensorContradictions } from './contradictionDetector';
import { detectSensorContradictions } from './contradictionDetector';

// ============================================================
// 3. CHIEF AGENT ORCHESTRATOR
// ============================================================

export async function orchestrateAgriIntelligence(ctx: FarmContext): Promise<AIRecommendation> {
  try {
    // Run all specialist domain agents
    const cropEv = runCropIntelligenceAgent(ctx);
    const weatherEv = runWeatherAgent(ctx);
    const soilEv = runSoilHealthAgent(ctx);
    const geoEv = runGeospatialAgent(ctx);
    const schemeEv = runSchemeAgent(ctx);
    const contradictions = detectSensorContradictions(ctx);

    const allEvidence = [...cropEv, ...weatherEv, ...soilEv, ...geoEv, ...schemeEv];

    const prompt = `${AGRI_SYSTEM_PROMPT}

You are the Chief Agricultural Intelligence Orchestrator for AgriOS.
Synthesize the domain agent findings, sensor telemetry, and detected data contradictions into a cohesive agricultural intelligence brief.

FARM PROFILE:
${JSON.stringify({
  name: ctx.farm.name,
  crop: ctx.farm.crop,
  cropStage: ctx.farm.cropStage,
  areaHectares: ctx.farm.areaHa,
  location: ctx.farm.location,
  irrigation: ctx.farm.irrigationType,
  practice: ctx.farm.farmingPractice,
}, null, 2)}

WEATHER OBSERVATION:
${ctx.weather ? JSON.stringify({
  temperature: ctx.weather.current.temperature,
  humidity: ctx.weather.current.humidity,
  forecast3DayRainfall: ctx.weather.forecast.slice(0, 3).reduce((s, d) => s + d.precipitation, 0) + ' mm',
  risks: ctx.weather.risks,
  source: ctx.weather.source,
  isDemo: ctx.weather.isDemo,
}, null, 2) : 'TELEMETRY UNAVAILABLE'}

SOIL PROFILE:
${ctx.soil ? JSON.stringify({
  ph: ctx.soil.ph,
  organicCarbon: ctx.soil.organicCarbon,
  bulkDensity: ctx.soil.bulkDensity,
  source: ctx.soil.source,
  isDemo: ctx.soil.isDemo,
}, null, 2) : 'SOIL DATA UNAVAILABLE'}

SATELLITE VEGETATION OBSERVATION:
${ctx.satellite ? JSON.stringify({
  ndvi: ctx.satellite.ndvi,
  trend: ctx.satellite.trend,
  trendValue: ctx.satellite.trendValue,
  source: ctx.satellite.source,
  isDemo: ctx.satellite.isDemo,
}, null, 2) : 'SATELLITE UNAVAILABLE'}

DOMAIN SPECIALIST EVIDENCE TRAIL:
${JSON.stringify(allEvidence, null, 2)}

DETECTED SENSOR CONTRADICTIONS & DISPUTES:
${JSON.stringify(contradictions, null, 2)}

Produce a valid JSON object matching this schema exactly:
{
  "summary": "Clear, practical 2-3 sentence overview written in farmer-friendly language",
  "riskLevel": "low|medium|high|critical",
  "confidence": 85,
  "evidence": [
    {"source": "weather|soil|satellite|crop_stage|farm_profile", "finding": "fact-based observation", "value": "optional number or metric"}
  ],
  "observations": ["observation 1", "observation 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "actionsToday": [
    {"action": "specific immediate task", "reason": "why this matters right now", "urgency": "immediate|today", "effort": "low|medium|high"}
  ],
  "actionsThisWeek": [
    {"action": "specific task for this week", "reason": "why", "urgency": "this_week", "effort": "low|medium|high"}
  ],
  "regenerativeActions": [
    {"action": "long term soil or biodiversity practice", "reason": "benefit", "urgency": "this_month", "effort": "medium"}
  ],
  "warnings": ["cautions, if any"],
  "needsFieldVerification": true,
  "dataSources": ["Open-Meteo", "SoilGrids", "Sentinel-2 GEE"],
  "disclaimer": "AI-assisted agronomic assessment. Verify in field before high-consequence interventions.",
  "generatedAt": "${new Date().toISOString()}"
}`;

    const result = await generateJSON<AIRecommendation>(prompt);

    // Compute confidence penalty for conflicting sensor signals
    const penalty = contradictions.reduce(
      (sum, c) => sum + (c.severity === 'high' ? 12 : c.severity === 'medium' ? 6 : 3),
      0
    );
    const baseConfidence = result.confidence || 75;
    const finalConfidence = Math.max(20, Math.min(95, baseConfidence - penalty));

    const contradictionWarnings = contradictions.map(
      (c) => `[Dispute Detected] ${c.conflict} Advice: ${c.resolutionAdvice}`
    );

    return {
      ...result,
      confidence: finalConfidence,
      contradictions,
      warnings: [...(result.warnings || []), ...contradictionWarnings],
      evidence: result.evidence && result.evidence.length > 0 ? result.evidence : allEvidence,
      generatedAt: new Date().toISOString(),
      disclaimer: 'AI-assisted assessment. Field verification recommended before high-cost or chemical applications.',
    };
  } catch (err) {
    console.error('[AI Orchestrator Error]', err);
    return getHonestFallbackRecommendation(ctx);
  }
}

/** Agent: Interactive Farmer Advisor Q&A */
export async function askFarmerAdvisor(ctx: FarmContext, question: string, preferredLanguage = 'en'): Promise<{ answer: string; evidence: AIEvidence[]; source: string }> {
  const languageInstruction = preferredLanguage === 'hi'
    ? 'Reply in clear, conversational, respectful Hindi (Devanagari script) with terms commonly understood by Indian farmers.'
    : 'Reply in clear, practical English tailored for Indian agricultural contexts.';

  const prompt = `You are the AgriOS Agricultural Intelligence Advisor speaking directly to an Indian farmer.
Reply in plain, natural, conversational text. DO NOT format your response as JSON or markdown code blocks.

FARM CONTEXT:
- Farm: ${ctx.farm.name} (${ctx.farm.location.state || ''}, ${ctx.farm.location.country})
- Crop: ${ctx.farm.crop} (${ctx.farm.cropStage} stage)
- Soil: ${ctx.soil ? `pH ${ctx.soil.ph}, SOC ${ctx.soil.organicCarbon} g/kg` : 'Unknown'}
- Weather: ${ctx.weather ? `${ctx.weather.current.temperature}°C, ${ctx.weather.current.humidity}% humidity, forecast ${ctx.weather.current.description}` : 'Unknown'}
- NDVI: ${ctx.satellite ? ctx.satellite.ndvi : 'Unknown'}

FARMER QUESTION:
"${question}"

INSTRUCTIONS:
${languageInstruction}
Provide an expert, empathetic, actionable answer in 2 to 4 concise paragraphs. Focus on practical field advice, safe practices, and mention consulting the local Krishi Vigyan Kendra (KVK) if physical inspection is required. Only speak in natural human sentences.`;

  try {
    const raw = await generateText(prompt);
    let cleanAnswer = raw.trim();

    // If Gemini formatted response as a JSON markdown block, parse out summary or text
    if (cleanAnswer.startsWith('```json') || cleanAnswer.startsWith('```')) {
      try {
        const jsonMatch = cleanAnswer.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1]);
          const mainSummary = parsed.summary_hi || parsed.summary_en || parsed.summary || parsed.answer || parsed.response;
          if (mainSummary) {
            let fullText = mainSummary;
            if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
              fullText += '\n\n' + (preferredLanguage === 'hi' ? 'सलाह:' : 'Recommendations:') + '\n' +
                parsed.recommendations.map((r: string) => `• ${r}`).join('\n');
            }
            cleanAnswer = fullText;
          }
        }
      } catch {
        // keep text as is
      }
    }

    return {
      answer: cleanAnswer,
      evidence: [
        { source: 'crop_stage', finding: `${ctx.farm.crop} at ${ctx.farm.cropStage}` },
        ...(ctx.weather ? [{ source: 'weather' as const, finding: `${ctx.weather.current.temperature}°C, ${ctx.weather.current.humidity}% humidity` }] : []),
      ],
      source: 'AgriOS Chief Intelligence Agent (Gemini)',
    };
  } catch (err) {
    console.error('[askFarmerAdvisor Error]', err);
    return {
      answer: preferredLanguage === 'hi'
        ? 'वर्तमान में एआई सलाहकार सेवा व्यस्त है। कृपया अपने खेत की मिट्टी और मौसम की वर्तमान स्थिति का ध्यान रखते हुए स्थानीय कृषि विशेषज्ञ से संपर्क करें।'
        : 'The AI advisor is temporarily unavailable. Based on your crop and stage, maintain appropriate irrigation intervals and monitor for symptoms.',
      evidence: [],
      source: 'AgriOS Local Fallback',
    };
  }
}

function getHonestFallbackRecommendation(ctx: FarmContext): AIRecommendation {
  const contradictions = detectSensorContradictions(ctx);
  const penalty = contradictions.reduce(
    (sum, c) => sum + (c.severity === 'high' ? 12 : c.severity === 'medium' ? 6 : 3),
    0
  );
  const baseConfidence = 65;
  const finalConfidence = Math.max(20, baseConfidence - penalty);
  const contradictionWarnings = contradictions.map(
    (c) => `[Dispute Detected] ${c.conflict} Advice: ${c.resolutionAdvice}`
  );

  return {
    summary: `Your ${ctx.farm.crop} is in ${ctx.farm.cropStage.replace('_', ' ')} stage in ${ctx.farm.location.state || 'your region'}. Real-time Gemini inference is temporarily running in offline mode. Standard agronomic safety guidelines apply.`,
    riskLevel: 'medium',
    confidence: finalConfidence,
    contradictions,
    evidence: [
      { source: 'crop_stage', finding: `${ctx.farm.crop} at ${ctx.farm.cropStage} stage` },
      ...(ctx.weather ? [{ source: 'weather' as const, finding: `${ctx.weather.current.temperature}°C, humidity ${ctx.weather.current.humidity}%` }] : []),
    ],
    observations: [
      `Crop is currently in ${ctx.farm.cropStage.replace('_', ' ')} stage`,
      ctx.weather ? `Current ambient humidity is ${ctx.weather.current.humidity}%` : 'Weather telemetry pending',
    ],
    recommendations: [
      'Maintain adequate moisture based on rainfall forecast',
      'Inspect representative leaves for early symptoms of foliar disease',
      'Ensure field drainage channels are clear of debris',
    ],
    actionsToday: [
      { action: 'Inspect field borders and lower plant canopy', reason: 'Early detection prevents yield loss', urgency: 'today', effort: 'low' },
    ],
    actionsThisWeek: [
      { action: 'Review nutrient application timing with stage requirements', reason: 'Optimize input efficiency', urgency: 'this_week', effort: 'medium' },
    ],
    regenerativeActions: [
      { action: 'Plan post-harvest crop residue retention or mulching', reason: 'Increases soil organic matter and water holding capacity', urgency: 'this_month', effort: 'medium' },
    ],
    warnings: ['Offline fallback report — verify field conditions manually.', ...contradictionWarnings],
    needsFieldVerification: true,
    dataSources: ['Open-Meteo', 'SoilGrids'],
    disclaimer: 'AI-assisted assessment. Field verification recommended.',
    generatedAt: new Date().toISOString(),
  };
}
