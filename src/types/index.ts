// ============================================================
// AgriOS — Core TypeScript Types
// ============================================================

// ---- Farm Types ----

export interface FarmLocation {
  lat: number;
  lng: number;
  address?: string;
  district?: string;
  state?: string;
  country: string;
}

export interface FarmBoundary {
  type: 'Polygon';
  coordinates: [number, number][];
}

export type IrrigationType = 'rainfed' | 'drip' | 'sprinkler' | 'flood' | 'canal' | 'borewell' | 'other';
export type FarmingPractice = 'conventional' | 'organic' | 'integrated' | 'regenerative' | 'traditional';
export type CropStage = 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'grain_fill' | 'maturity' | 'harvest';

export interface Farm {
  id: string;
  ownerId: string;
  name: string;
  location: FarmLocation;
  boundary?: FarmBoundary;
  areaHa: number;
  crop: string;
  cropVariety?: string;
  cropStage: CropStage;
  plantingDate?: string;
  harvestDate?: string;
  irrigationType: IrrigationType;
  farmingPractice: FarmingPractice;
  createdAt: string;
  updatedAt: string;
}

// ---- Weather Types ----

export interface WeatherCondition {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
}

export interface WeatherForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  precipitationProbability: number;
  humidity: number;
  weatherCode: number;
  description: string;
}

export interface WeatherRisk {
  irrigationStress: 'low' | 'moderate' | 'high' | 'critical';
  heatStress: 'low' | 'moderate' | 'high' | 'critical';
  diseaseRisk: 'low' | 'moderate' | 'high' | 'critical';
  droughtRisk: 'low' | 'moderate' | 'high' | 'critical';
  rainfallOpportunity: boolean;
  sprayConditions: 'favorable' | 'marginal' | 'unfavorable';
}

export interface WeatherData {
  current: WeatherCondition;
  forecast: WeatherForecastDay[];
  risks: WeatherRisk;
  source: string;
  fetchedAt: string;
  isDemo: boolean;
}

// ---- Soil Types ----

export type SoilDataSource = 'soilgrids' | 'local_data' | 'demo';

export interface SoilProfile {
  ph: number;
  organicCarbon: number; // g/kg
  sand: number; // %
  silt: number; // %
  clay: number; // %
  bulkDensity: number; // kg/dm³
  nitrogen?: number;
  source: SoilDataSource;
  fetchedAt: string;
  isDemo: boolean;
}

export interface SoilHealth {
  phStatus: 'acidic' | 'slightly_acidic' | 'neutral' | 'slightly_alkaline' | 'alkaline';
  socStatus: 'very_low' | 'low' | 'medium' | 'high';
  textureClass: string;
  overallHealth: 'poor' | 'fair' | 'good' | 'excellent';
  recommendations: string[];
}

// ---- Satellite Types ----

export type NDVIStatus = 'stressed' | 'moderate' | 'healthy' | 'very_healthy';

export interface SatelliteSnapshot {
  farmId: string;
  date: string;
  ndvi: number;
  ndviMin: number;
  ndviMax: number;
  ndmiAvg?: number;
  trend: 'declining' | 'stable' | 'improving';
  trendValue: number; // delta from previous
  status: NDVIStatus;
  source: string;
  isDemo: boolean;
}

// ---- Disease Assessment Types ----

export type DiseaseSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface DiseaseEvidence {
  type: 'visual' | 'weather' | 'soil' | 'satellite' | 'crop_stage';
  description: string;
}

export interface DiseaseAssessment {
  id: string;
  farmId: string;
  imageUrl?: string;
  likelyIssue: string;
  confidence: number; // 0–100
  severity: DiseaseSeverity;
  symptoms: string[];
  possibleCauses: string[];
  evidence: DiseaseEvidence[];
  alternatives: string[];
  recommendedAction: string;
  prevention: string[];
  verificationSteps: string[];
  needsFieldVerification: boolean;
  disclaimer: string;
  assessedAt: string;
  isDemo?: boolean;
}

// ---- AI Types ----

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AIEvidence {
  source: 'weather' | 'soil' | 'satellite' | 'image' | 'crop_stage' | 'farm_profile';
  finding: string;
  value?: string | number;
}

export interface AIAction {
  action: string;
  reason: string;
  urgency: 'immediate' | 'today' | 'this_week' | 'this_month';
  effort: 'low' | 'medium' | 'high';
}

export interface AIRecommendation {
  summary: string;
  riskLevel: RiskLevel;
  confidence: number; // 0–100
  evidence: AIEvidence[];
  observations: string[];
  recommendations: string[];
  actionsToday: AIAction[];
  actionsThisWeek: AIAction[];
  regenerativeActions: AIAction[];
  warnings: string[];
  needsFieldVerification: boolean;
  dataSources: string[];
  disclaimer: string;
  generatedAt: string;
}

// ---- Regenerative Score Types ----

export interface ScoreCategory {
  name: string;
  score: number; // 0–100
  maxScore: 100;
  status: 'poor' | 'fair' | 'good' | 'excellent';
  explanation: string;
  improvements: string[];
  confidence: number;
}

export interface RegenerativeScore {
  farmId: string;
  total: number; // 0–100
  label: string; // "AgriOS Regenerative Index"
  categories: {
    soilHealth: ScoreCategory;
    waterEfficiency: ScoreCategory;
    biodiversity: ScoreCategory;
    inputEfficiency: ScoreCategory;
    cropResilience: ScoreCategory;
    carbonOM: ScoreCategory;
    climateResilience: ScoreCategory;
  };
  scoredAt: string;
  disclaimer: string;
}

// ---- Simulation Types ----

export type ScenarioType = 'current' | 'water_saving' | 'regenerative';

export interface SimulationParameters {
  irrigationIntensity: number; // 0–100
  fertilizerIntensity: number; // 0–100
  tillageIntensity: number; // 0–100
  coverCrop: boolean;
  cropRotation: boolean;
  organicMatter: boolean;
  integratedPestManagement: boolean;
}

export interface SimulationResult {
  scenario: ScenarioType;
  label: string;
  parameters: SimulationParameters;
  waterUse: number; // relative % vs current
  inputUse: number; // relative %
  estimatedCost: number; // relative %
  soilHealthDirection: 'declining' | 'stable' | 'improving';
  yieldDirection: 'declining' | 'stable' | 'improving' | 'positive';
  resilienceScore: number; // 0–100
  riskLevel: RiskLevel;
  explanation: string;
  assumptions: string[];
}

export interface SimulationComparison {
  farmId: string;
  scenarios: SimulationResult[];
  recommendation: string;
  disclaimer: string;
  generatedAt: string;
}

// ---- Roadmap Types ----

export interface RoadmapAction {
  action: string;
  why: string;
  expectedBenefit: string;
  effort: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  category: 'soil' | 'water' | 'crop' | 'pest' | 'biodiversity' | 'input' | 'monitoring';
}

export interface RoadmapPhase {
  phase: 1 | 2 | 3;
  label: string;
  startDay: number;
  endDay: number;
  focus: string;
  actions: RoadmapAction[];
}

export interface RegenerativeRoadmap {
  farmId: string;
  phases: RoadmapPhase[];
  overallGoal: string;
  expectedOutcomes: string[];
  generatedAt: string;
  disclaimer: string;
}

// ---- AgriMesh Types ----

export interface AgriNodeContribution {
  type: 'disease_pattern' | 'crop_model' | 'practice' | 'climate_insight' | 'soil_knowledge';
  title: string;
  description: string;
  crop?: string;
  region?: string;
  sharedAt: string;
}

export interface AgriNode {
  id: string;
  country: string;
  countryCode: string;
  nodeLabel: string;
  lat: number;
  lng: number;
  status: 'active' | 'syncing' | 'offline';
  contributionsCount: number;
  contributions: AgriNodeContribution[];
  modelVersion?: string;
  lastSync: string;
  isSimulated: boolean;
}

export interface KnowledgeExchangeEvent {
  id: string;
  fromNode: string;
  toNode: string;
  type: AgriNodeContribution['type'];
  title: string;
  timestamp: string;
}

// ---- Alert Types ----

export type AlertType = 'heat_stress' | 'rainfall_deficit' | 'heavy_rainfall' | 'disease_risk' | 'irrigation_stress' | 'frost_risk' | 'pest_alert';

export interface FarmAlert {
  id: string;
  farmId: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  recommendedAction: string;
  createdAt: string;
  read: boolean;
}

// ---- Farm Twin (Combined) ----

export interface FarmTwin {
  farm: Farm;
  weather?: WeatherData;
  soil?: SoilProfile;
  satellite?: SatelliteSnapshot;
  recommendation?: AIRecommendation;
  regenerativeScore?: RegenerativeScore;
  alerts: FarmAlert[];
  lastUpdated: string;
}

// ---- Context for AI ----

export interface FarmContext {
  farm: Farm;
  weather: WeatherData | null;
  soil: SoilProfile | null;
  satellite: SatelliteSnapshot | null;
  recentObservations?: string[];
  alerts?: FarmAlert[];
  regenerativeScore?: RegenerativeScore | null;
  /** True when any part of the context falls back to demo data. */
  isDemo: boolean;
}
