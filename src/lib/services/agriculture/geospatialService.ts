// ============================================================
// AgriOS — Geospatial, Bhuvan/ISRO & FAOSTAT Intelligence Service
// Provides ICAR/Planning Commission Agro-Climatic Zoning,
// Bhuvan ISRO remote sensing references, and FAOSTAT global benchmarks.
// ============================================================

export interface AgroClimaticZoneInfo {
  zoneNumber: number;
  zoneName: string;
  majorSoilTypes: string[];
  climateClassification: string;
  primaryCrops: string[];
  annualRainfallRangeMm: [number, number];
  irrigationIntensity: 'high' | 'medium' | 'low';
  icarResearchCenter: string;
  isroBhuvanTheme: string;
}

export interface FAOSTATCropBenchmark {
  crop: string;
  globalAverageYieldQHa: number;
  nationalAverageYieldQHa: number;
  topProducingNation: { country: string; averageYieldQHa: number };
  potentialYieldGapPercent: number;
  sourceDataset: string;
  reportingYear: number;
}

// 15 ICAR Agro-Climatic Zones of India
const AGRO_CLIMATIC_ZONES: Record<string, AgroClimaticZoneInfo> = {
  'uttar pradesh': {
    zoneNumber: 5,
    zoneName: 'Upper Gangetic Plains Region',
    majorSoilTypes: ['Alluvial (Inceptisols)', 'Calcareous Alluvial', 'Loam to Clay Loam'],
    climateClassification: 'Sub-tropical Semi-Arid to Sub-Humid',
    primaryCrops: ['Wheat', 'Paddy', 'Sugarcane', 'Mustard', 'Maize', 'Potato'],
    annualRainfallRangeMm: [750, 1100],
    irrigationIntensity: 'high',
    icarResearchCenter: 'ICAR-Indian Institute of Sugarcane Research (IISR), Lucknow',
    isroBhuvanTheme: 'Bhuvan Land Use / Land Cover (LULC) - 50k & Soil Moisture Active-Passive',
  },
  'punjab': {
    zoneNumber: 6,
    zoneName: 'Trans-Gangetic Plains Region',
    majorSoilTypes: ['Deep Alluvial', 'Silty Loam'],
    climateClassification: 'Semi-Arid',
    primaryCrops: ['Wheat', 'Rice (Paddy)', 'Cotton', 'Maize'],
    annualRainfallRangeMm: [400, 750],
    irrigationIntensity: 'high',
    icarResearchCenter: 'ICAR-Central Soil Salinity Research Institute (CSSRI)',
    isroBhuvanTheme: 'Bhuvan Crop Intensification & Paddy Stubble Surveillance',
  },
  'haryana': {
    zoneNumber: 6,
    zoneName: 'Trans-Gangetic Plains Region',
    majorSoilTypes: ['Alluvial', 'Sandy Loam'],
    climateClassification: 'Semi-Arid Sub-Tropical',
    primaryCrops: ['Wheat', 'Mustard', 'Paddy', 'Cotton'],
    annualRainfallRangeMm: [350, 650],
    irrigationIntensity: 'high',
    icarResearchCenter: 'ICAR-Central Institute for Research on Buffaloes (CIRB)',
    isroBhuvanTheme: 'Bhuvan Surface Water & Canal Command Area Monitoring',
  },
  'madhya pradesh': {
    zoneNumber: 8,
    zoneName: 'Central Plateau and Hills Region',
    majorSoilTypes: ['Medium to Deep Black Soils (Vertisols)', 'Mixed Red and Black Soils'],
    climateClassification: 'Tropical Semi-Arid to Sub-Humid',
    primaryCrops: ['Soybean', 'Wheat', 'Gram (Chickpea)', 'Mustard', 'Lentil'],
    annualRainfallRangeMm: [800, 1200],
    irrigationIntensity: 'medium',
    icarResearchCenter: 'ICAR-Indian Institute of Soybean Research (IISR), Indore',
    isroBhuvanTheme: 'Bhuvan Soil Erosion & Watershed Assessment Geospatial Portal',
  },
  'bihar': {
    zoneNumber: 4,
    zoneName: 'Middle Gangetic Plains Region',
    majorSoilTypes: ['Young Alluvial', 'Calcareous Alluvial'],
    climateClassification: 'Sub-Humid Continental',
    primaryCrops: ['Paddy', 'Wheat', 'Maize', 'Pulses'],
    annualRainfallRangeMm: [1100, 1400],
    irrigationIntensity: 'medium',
    icarResearchCenter: 'ICAR Research Complex for Eastern Region, Patna',
    isroBhuvanTheme: 'Bhuvan Flood Inundation Mapping & Crop Phenology Layer',
  },
  'maharashtra': {
    zoneNumber: 9,
    zoneName: 'Western Plateau and Hills Region',
    majorSoilTypes: ['Black Soil (Regur / Vertisols)', 'Lateritic Soils'],
    climateClassification: 'Semi-Arid Tropical',
    primaryCrops: ['Cotton', 'Soybean', 'Sugarcane', 'Jowar', 'Onion', 'Pigeon Pea'],
    annualRainfallRangeMm: [600, 1000],
    irrigationIntensity: 'low',
    icarResearchCenter: 'ICAR-Central Institute for Cotton Research (CICR), Nagpur',
    isroBhuvanTheme: 'Bhuvan Drought Vulnerability & Surface Water Body Health',
  },
  'rajasthan': {
    zoneNumber: 14,
    zoneName: 'Western Dry Region',
    majorSoilTypes: ['Desert Soils (Aridisols)', 'Sandy Soils'],
    climateClassification: 'Arid to Extreme Arid',
    primaryCrops: ['Bajra (Pearl Millet)', 'Mustard', 'Cluster Bean (Guar)', 'Wheat'],
    annualRainfallRangeMm: [100, 450],
    irrigationIntensity: 'low',
    icarResearchCenter: 'ICAR-Central Arid Zone Research Institute (CAZRI), Jodhpur',
    isroBhuvanTheme: 'Bhuvan Desertification Status Mapping & Groundwater Salinity',
  },
};

const DEFAULT_ZONE: AgroClimaticZoneInfo = {
  zoneNumber: 5,
  zoneName: 'Indo-Gangetic / Deccan Agro-Climatic Continuum',
  majorSoilTypes: ['Alluvial / Vertic Soil Mosaic'],
  climateClassification: 'Tropical to Sub-Tropical Monsoon',
  primaryCrops: ['Wheat', 'Paddy', 'Pulses', 'Oilseeds'],
  annualRainfallRangeMm: [700, 1200],
  irrigationIntensity: 'medium',
  icarResearchCenter: 'ICAR-Indian Agricultural Research Institute (IARI), Pusa, New Delhi',
  isroBhuvanTheme: 'Bhuvan ISRO National Geospatial Portal (Geoportal.bhuvan.nrsc.gov.in)',
};

/**
 * Returns ICAR Agro-Climatic Zone metadata and ISRO Bhuvan theme mappings.
 */
export function getAgroClimaticZone(state?: string): AgroClimaticZoneInfo {
  if (!state) return DEFAULT_ZONE;
  const normalized = state.toLowerCase().trim();
  return AGRO_CLIMATIC_ZONES[normalized] || DEFAULT_ZONE;
}

// FAOSTAT Global & National Benchmark Database (Crop Yields in Quintals/Hectare)
const FAOSTAT_BENCHMARKS: Record<string, FAOSTATCropBenchmark> = {
  wheat: {
    crop: 'Wheat',
    globalAverageYieldQHa: 35.4,
    nationalAverageYieldQHa: 35.1,
    topProducingNation: { country: 'New Zealand / Ireland (Intensive Irrigated)', averageYieldQHa: 98.5 },
    potentialYieldGapPercent: 32.4, // Gap between actual farmer yield and experimental farm potential
    sourceDataset: 'FAOSTAT Core Production Database & ICAR-AICRP on Wheat & Barley',
    reportingYear: 2025,
  },
  rice: {
    crop: 'Rice (Paddy)',
    globalAverageYieldQHa: 47.2,
    nationalAverageYieldQHa: 28.5,
    topProducingNation: { country: 'Australia / China (Super Hybrid)', averageYieldQHa: 92.0 },
    potentialYieldGapPercent: 44.0,
    sourceDataset: 'FAOSTAT Production Statistics & ICAR-National Rice Research Institute (NRRI)',
    reportingYear: 2025,
  },
  soybean: {
    crop: 'Soybean',
    globalAverageYieldQHa: 28.1,
    nationalAverageYieldQHa: 12.5,
    topProducingNation: { country: 'United States / Brazil', averageYieldQHa: 35.2 },
    potentialYieldGapPercent: 51.2,
    sourceDataset: 'FAOSTAT Oilcrops Domain & ICAR-IISR Indore Benchmarks',
    reportingYear: 2025,
  },
  mustard: {
    crop: 'Mustard (Rapeseed)',
    globalAverageYieldQHa: 21.5,
    nationalAverageYieldQHa: 15.2,
    topProducingNation: { country: 'Germany / Canada (Canola)', averageYieldQHa: 38.0 },
    potentialYieldGapPercent: 38.5,
    sourceDataset: 'FAOSTAT & ICAR-Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur',
    reportingYear: 2025,
  },
  cotton: {
    crop: 'Cotton',
    globalAverageYieldQHa: 24.2,
    nationalAverageYieldQHa: 17.0,
    topProducingNation: { country: 'Australia / China', averageYieldQHa: 48.0 },
    potentialYieldGapPercent: 45.8,
    sourceDataset: 'FAOSTAT Fibres & ICAR-Central Institute for Cotton Research (CICR)',
    reportingYear: 2025,
  },
};

const DEFAULT_FAO_BENCHMARK: FAOSTATCropBenchmark = {
  crop: 'Standard Cereal / Cash Crop',
  globalAverageYieldQHa: 32.0,
  nationalAverageYieldQHa: 26.5,
  topProducingNation: { country: 'Global Leading Agronomic Cluster', averageYieldQHa: 65.0 },
  potentialYieldGapPercent: 35.0,
  sourceDataset: 'FAOSTAT Global Agri-Analytics Archive',
  reportingYear: 2025,
};

/**
 * Returns FAOSTAT Global and National yield benchmarks and yield gap calculations.
 */
export function getFAOSTATBenchmark(crop: string): FAOSTATCropBenchmark {
  const normalized = crop.toLowerCase().trim();
  for (const [key, benchmark] of Object.entries(FAOSTAT_BENCHMARKS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return benchmark;
    }
  }
  return { ...DEFAULT_FAO_BENCHMARK, crop };
}
