// ============================================================
// AgriOS — What-If Scenario Engine (Heuristic, Transparent)
// ============================================================
import { Farm, SimulationComparison, SimulationResult, SimulationParameters } from '@/types';

const BASE_PARAMS: Record<string, SimulationParameters> = {
  current: {
    irrigationIntensity: 80,
    fertilizerIntensity: 75,
    tillageIntensity: 70,
    coverCrop: false,
    cropRotation: false,
    organicMatter: false,
    integratedPestManagement: false,
  },
  water_saving: {
    irrigationIntensity: 55,
    fertilizerIntensity: 70,
    tillageIntensity: 65,
    coverCrop: false,
    cropRotation: false,
    organicMatter: false,
    integratedPestManagement: true,
  },
  regenerative: {
    irrigationIntensity: 55,
    fertilizerIntensity: 50,
    tillageIntensity: 30,
    coverCrop: true,
    cropRotation: true,
    organicMatter: true,
    integratedPestManagement: true,
  },
};

export function runSimulation(farm: Farm, customParams?: Partial<SimulationParameters>): SimulationComparison {
  const scenarios: SimulationResult[] = [
    buildScenario('current', { ...BASE_PARAMS.current, ...customParams }),
    buildScenario('water_saving', BASE_PARAMS.water_saving),
    buildScenario('regenerative', BASE_PARAMS.regenerative),
  ];

  return {
    farmId: farm.id,
    scenarios,
    recommendation: 'The Regenerative scenario shows the strongest long-term potential for soil health and resilience improvement, with moderate upfront investment.',
    disclaimer: 'Simulation estimates are based on transparent heuristic assumptions and should not be interpreted as calibrated agronomic predictions. Actual results vary by location, soil type, climate, and management skill.',
    generatedAt: new Date().toISOString(),
  };
}

function buildScenario(type: 'current' | 'water_saving' | 'regenerative', params: SimulationParameters): SimulationResult {
  const labels = {
    current: 'Current Practice',
    water_saving: 'Water-Saving',
    regenerative: 'Regenerative',
  };

  // Heuristic delta calculations — fully transparent
  const irrigBase = params.irrigationIntensity;
  const waterUse = type === 'current' ? 100 : Math.round((irrigBase / 80) * 100);

  const fertBase = params.fertilizerIntensity;
  const inputUse = type === 'current' ? 100 : Math.round((fertBase / 75) * 100);
  const estimatedCost = type === 'current' ? 100 : inputUse - 5; // slight saving beyond input reduction

  const soilDirection =
    params.organicMatter && params.coverCrop ? 'improving' :
    params.organicMatter || params.coverCrop ? 'improving' :
    type === 'current' ? 'stable' : 'stable';

  const yieldDirection =
    type === 'regenerative' ? 'positive' :
    type === 'water_saving' ? 'stable' : 'stable';

  const resilienceScore =
    type === 'regenerative' ? 78 :
    type === 'water_saving' ? 60 : 45;

  const riskLevel =
    type === 'regenerative' ? 'low' :
    type === 'water_saving' ? 'medium' : 'medium';

  const explanations = {
    current: 'Current practices maintain yield but may deplete soil health over time. High water and input use creates cost pressure.',
    water_saving: 'Reducing irrigation intensity and adopting IPM reduces water use by ~15-20%. Minimal yield impact expected in most conditions.',
    regenerative: 'Cover crops, crop rotation and reduced tillage rebuild soil organic matter over 2-3 years. Short-term yield may vary but long-term resilience improves significantly.',
  };

  const assumptions = {
    current: ['Baseline water use set to irrigation intensity of 80%', 'Fertilizer intensity at 75% of maximum', 'No cover crop or rotation'],
    water_saving: ['Drip/micro-irrigation reduces water by ~15-25% vs flood', 'IPM reduces pesticide use by ~20%', 'Yield impact: ±2% depending on conditions'],
    regenerative: ['Cover crop adds 0.2-0.5 g/kg organic carbon per year', 'Reduced tillage cuts fuel/labor costs 10-15%', 'Benefits compound over 2-5 year timeframe'],
  };

  return {
    scenario: type,
    label: labels[type],
    parameters: params,
    waterUse,
    inputUse,
    estimatedCost,
    soilHealthDirection: soilDirection,
    yieldDirection,
    resilienceScore,
    riskLevel,
    explanation: explanations[type],
    assumptions: assumptions[type],
  };
}
