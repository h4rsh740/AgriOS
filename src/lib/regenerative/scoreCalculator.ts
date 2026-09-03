// ============================================================
// AgriOS — Regenerative Score Calculator (Rule-Based)
// Transparent heuristic engine — labeled as estimate
// ============================================================
import { Farm, SoilProfile, WeatherData, SatelliteSnapshot, RegenerativeScore, ScoreCategory } from '@/types';

interface ScoreInput {
  farm: Farm;
  soil: SoilProfile | null;
  weather: WeatherData | null;
  satellite: SatelliteSnapshot | null;
}

export function calculateRegenerativeScore(input: ScoreInput): RegenerativeScore {
  const { farm, soil, weather, satellite } = input;

  const soilHealth = scoreSoilHealth(soil, farm);
  const waterEfficiency = scoreWaterEfficiency(farm, weather);
  const biodiversity = scoreBiodiversity(farm);
  const inputEfficiency = scoreInputEfficiency(farm);
  const cropResilience = scoreCropResilience(farm, satellite, weather);
  const carbonOM = scoreCarbonOM(soil);
  const climateResilience = scoreClimateResilience(farm, weather);

  // Weighted average
  const weights = { soilHealth: 0.20, waterEfficiency: 0.18, biodiversity: 0.12, inputEfficiency: 0.15, cropResilience: 0.15, carbonOM: 0.10, climateResilience: 0.10 };
  const total = Math.round(
    soilHealth.score * weights.soilHealth +
    waterEfficiency.score * weights.waterEfficiency +
    biodiversity.score * weights.biodiversity +
    inputEfficiency.score * weights.inputEfficiency +
    cropResilience.score * weights.cropResilience +
    carbonOM.score * weights.carbonOM +
    climateResilience.score * weights.climateResilience
  );

  return {
    farmId: farm.id,
    total,
    label: 'AgriOS Regenerative Index',
    categories: { soilHealth, waterEfficiency, biodiversity, inputEfficiency, cropResilience, carbonOM, climateResilience },
    scoredAt: new Date().toISOString(),
    disclaimer: 'AgriOS Regenerative Index is a composite heuristic indicator, not an official scientific certification. Scores are estimates based on available farm data and farming practice inputs.',
  };
}

function statusFromScore(score: number): ScoreCategory['status'] {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function scoreSoilHealth(soil: SoilProfile | null, farm: Farm): ScoreCategory {
  if (!soil) return { name: 'Soil Health', score: 50, maxScore: 100, status: 'fair', explanation: 'Soil data not available — using estimate.', improvements: ['Request soil test'], confidence: 30 };

  let score = 60; // base
  // pH scoring
  if (soil.ph >= 6.0 && soil.ph <= 7.0) score += 15;
  else if (soil.ph >= 5.5 && soil.ph <= 7.5) score += 8;
  else score -= 5;
  // SOC scoring
  if (soil.organicCarbon >= 2.0) score += 15;
  else if (soil.organicCarbon >= 1.0) score += 8;
  else if (soil.organicCarbon < 0.5) score -= 10;
  else score += 2;
  // Adjust for regenerative practice
  if (farm.farmingPractice === 'regenerative') score += 10;
  if (farm.farmingPractice === 'organic') score += 5;

  score = Math.min(100, Math.max(0, score));

  const phNote = soil.ph > 8 ? `pH ${soil.ph} is alkaline — reduces nutrient availability. ` : soil.ph < 5.5 ? `pH ${soil.ph} is acidic — may limit crop growth. ` : `pH ${soil.ph} is in acceptable range. `;
  const socNote = soil.organicCarbon < 0.5 ? `Organic carbon very low (${soil.organicCarbon} g/kg) — soil biology is limited.` : soil.organicCarbon < 1.0 ? `Organic carbon low (${soil.organicCarbon} g/kg) — improvement possible.` : `Organic carbon adequate (${soil.organicCarbon} g/kg).`;

  return {
    name: 'Soil Health',
    score,
    maxScore: 100,
    status: statusFromScore(score),
    explanation: phNote + socNote,
    improvements: [
      soil.organicCarbon < 1.0 ? 'Add composted organic matter annually' : 'Maintain current organic matter practices',
      soil.ph > 7.5 ? 'Consider pH-balanced amendments' : 'Monitor pH seasonally',
      'Minimize soil compaction with reduced tillage',
    ],
    confidence: soil.isDemo ? 55 : 78,
  };
}

function scoreWaterEfficiency(farm: Farm, weather: WeatherData | null): ScoreCategory {
  let score = 60;
  if (farm.irrigationType === 'drip') score += 25;
  else if (farm.irrigationType === 'sprinkler') score += 15;
  else if (farm.irrigationType === 'rainfed') score += 10;
  else if (farm.irrigationType === 'flood') score -= 10;

  if (weather && weather.risks.rainfallOpportunity) score += 5;

  score = Math.min(100, Math.max(0, score));
  const irrNote = farm.irrigationType === 'drip' ? 'Drip irrigation provides excellent water efficiency.' :
    farm.irrigationType === 'flood' ? 'Flood irrigation has low water efficiency — consider upgrading.' :
    `${farm.irrigationType} irrigation is moderately efficient.`;

  return {
    name: 'Water Efficiency',
    score,
    maxScore: 100,
    status: statusFromScore(score),
    explanation: irrNote + (weather?.risks.rainfallOpportunity ? ' Recent rainfall opportunity reduces irrigation need.' : ''),
    improvements: [
      farm.irrigationType !== 'drip' ? 'Consider drip/micro-irrigation upgrade' : 'Maintain drip system regularly',
      'Schedule irrigation based on crop stage and weather forecast',
      'Use mulching to reduce soil evaporation',
    ],
    confidence: 72,
  };
}

function scoreBiodiversity(farm: Farm): ScoreCategory {
  let score = 45;
  if (farm.farmingPractice === 'regenerative') score += 30;
  if (farm.farmingPractice === 'organic') score += 15;
  if (farm.farmingPractice === 'integrated') score += 10;
  score = Math.min(100, Math.max(0, score));

  return {
    name: 'Biodiversity',
    score,
    maxScore: 100,
    status: statusFromScore(score),
    explanation: `Biodiversity score based on farming practice (${farm.farmingPractice}). Single-crop monoculture reduces biodiversity. Crop rotation and cover crops can improve this score significantly.`,
    improvements: [
      'Introduce crop rotation with legumes',
      'Plant cover crops during off-season',
      'Maintain uncultivated field margins for beneficial insects',
    ],
    confidence: 60,
  };
}

function scoreInputEfficiency(farm: Farm): ScoreCategory {
  let score = 60;
  if (farm.farmingPractice === 'regenerative') score += 25;
  if (farm.farmingPractice === 'organic') score += 20;
  if (farm.farmingPractice === 'integrated') score += 10;
  score = Math.min(100, Math.max(0, score));

  return {
    name: 'Input Efficiency',
    score,
    maxScore: 100,
    status: statusFromScore(score),
    explanation: `Input efficiency reflects use of fertilizers, pesticides and other inputs. ${farm.farmingPractice === 'regenerative' ? 'Regenerative practice reduces external input dependency.' : 'There may be opportunities to reduce input use.'}`,
    improvements: [
      'Test soil before applying fertilizers',
      'Use integrated pest management (IPM)',
      'Explore biostimulants as partial fertilizer alternatives',
    ],
    confidence: 65,
  };
}

function scoreCropResilience(farm: Farm, satellite: SatelliteSnapshot | null, weather: WeatherData | null): ScoreCategory {
  let score = 65;
  if (satellite) {
    if (satellite.ndvi > 0.6) score += 10;
    else if (satellite.ndvi < 0.3) score -= 15;
    if (satellite.trend === 'improving') score += 5;
    if (satellite.trend === 'declining') score -= 10;
  }
  if (weather?.risks.heatStress !== 'low') score -= 5;
  score = Math.min(100, Math.max(0, score));

  return {
    name: 'Crop Resilience',
    score,
    maxScore: 100,
    status: statusFromScore(score),
    explanation: `Crop resilience based on ${satellite ? `current vegetation signal (NDVI ${satellite.ndvi})` : 'farm context'} and weather risk. ${satellite?.trend === 'declining' ? 'Declining vegetation trend reduces resilience score.' : ''}`,
    improvements: [
      'Consider stress-tolerant varieties for future seasons',
      'Maintain optimal crop nutrition for stress resilience',
      'Monitor and respond early to disease or pest pressure',
    ],
    confidence: satellite ? 75 : 50,
  };
}

function scoreCarbonOM(soil: SoilProfile | null): ScoreCategory {
  if (!soil) return { name: 'Carbon & Organic Matter', score: 50, maxScore: 100, status: 'fair', explanation: 'Soil data not available.', improvements: ['Add organic matter to improve soil carbon'], confidence: 30 };

  let score = 50;
  if (soil.organicCarbon >= 2.0) score = 85;
  else if (soil.organicCarbon >= 1.5) score = 75;
  else if (soil.organicCarbon >= 1.0) score = 65;
  else if (soil.organicCarbon >= 0.5) score = 50;
  else score = 35;

  return {
    name: 'Carbon & Organic Matter',
    score,
    maxScore: 100,
    status: statusFromScore(score),
    explanation: `Soil organic carbon is ${soil.organicCarbon} g/kg. ${soil.organicCarbon < 1.0 ? 'Below optimal level (>1.0 g/kg) — increasing organic matter improves water retention, soil biology and carbon sequestration.' : 'Adequate level — maintain with annual organic inputs.'}`,
    improvements: [
      'Incorporate crop residues instead of burning',
      'Apply compost or vermicompost annually',
      'Avoid bare soil — plant cover crops',
    ],
    confidence: soil.isDemo ? 55 : 78,
  };
}

function scoreClimateResilience(farm: Farm, weather: WeatherData | null): ScoreCategory {
  let score = 65;
  if (farm.irrigationType !== 'rainfed') score += 10; // has irrigation access
  if (weather?.risks.droughtRisk === 'high') score -= 15;
  if (weather?.risks.heatStress === 'critical') score -= 10;
  if (farm.farmingPractice === 'regenerative') score += 10;
  score = Math.min(100, Math.max(0, score));

  return {
    name: 'Climate Resilience',
    score,
    maxScore: 100,
    status: statusFromScore(score),
    explanation: `Climate resilience based on irrigation access, current weather risks, and farming practice. ${weather?.risks.droughtRisk === 'high' ? 'Drought risk detected — resilience reduced.' : 'Climate risks are currently manageable.'}`,
    improvements: [
      'Diversify crop portfolio across seasons',
      'Improve water storage infrastructure',
      'Build soil organic matter to buffer against drought',
    ],
    confidence: 70,
  };
}
