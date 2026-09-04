// ============================================================
// AgriOS — Crop Agronomy & Knowledge Service
// Scientific knowledge base for Indian crops across phenological stages
// ============================================================
import type { CropStage } from '@/types';

export interface CropProfile {
  name: string;
  botanicalName: string;
  season: 'Rabi' | 'Kharif' | 'Zaid';
  idealTempRange: { min: number; max: number };
  waterRequirementMm: number;
  criticalStagesForIrrigation: CropStage[];
  commonDiseases: string[];
  soilPreferences: {
    minPh: number;
    maxPh: number;
    preferredTextures: string[];
  };
  regenerativeAdvice: {
    recommendedCoverCrops: string[];
    mulchingBenefit: string;
    naturalPestPredators: string[];
  };
}

export const CROP_PROFILES: Record<string, CropProfile> = {
  Wheat: {
    name: 'Wheat',
    botanicalName: 'Triticum aestivum',
    season: 'Rabi',
    idealTempRange: { min: 12, max: 25 },
    waterRequirementMm: 450,
    criticalStagesForIrrigation: ['seedling', 'vegetative', 'flowering', 'grain_fill'],
    commonDiseases: ['Yellow Rust', 'Brown Rust', 'Powdery Mildew', 'Karnal Bunt', 'Loose Smut'],
    soilPreferences: {
      minPh: 6.0,
      maxPh: 7.5,
      preferredTextures: ['Loam', 'Clay Loam'],
    },
    regenerativeAdvice: {
      recommendedCoverCrops: ['Sesbania (Dhaincha)', 'Cowpea', 'Mustard'],
      mulchingBenefit: 'Reduces soil evaporation by 30% and keeps root zone cooler by 2-3°C during early grain filling.',
      naturalPestPredators: ['Ladybird beetles', 'Hoverfly larvae (against aphids)'],
    },
  },
  Rice: {
    name: 'Rice / Paddy',
    botanicalName: 'Oryza sativa',
    season: 'Kharif',
    idealTempRange: { min: 20, max: 35 },
    waterRequirementMm: 1200,
    criticalStagesForIrrigation: ['seedling', 'vegetative', 'flowering', 'grain_fill'],
    commonDiseases: ['Bacterial Leaf Blight', 'Blast', 'Sheath Blight', 'Brown Spot'],
    soilPreferences: {
      minPh: 5.5,
      maxPh: 7.2,
      preferredTextures: ['Clay', 'Clay Loam', 'Silty Clay'],
    },
    regenerativeAdvice: {
      recommendedCoverCrops: ['Azolla bio-fertilizer', 'Sesbania green manure'],
      mulchingBenefit: 'Alternate Wetting and Drying (AWD) saves 25% irrigation water and reduces methane emissions by 30%.',
      naturalPestPredators: ['Dragonflies', 'Spiders', 'Mirid bugs'],
    },
  },
  Mustard: {
    name: 'Mustard',
    botanicalName: 'Brassica juncea',
    season: 'Rabi',
    idealTempRange: { min: 10, max: 24 },
    waterRequirementMm: 300,
    criticalStagesForIrrigation: ['vegetative', 'flowering'],
    commonDiseases: ['White Rust', 'Alternaria Leaf Blight', 'Downy Mildew'],
    soilPreferences: {
      minPh: 6.2,
      maxPh: 7.8,
      preferredTextures: ['Loam', 'Sandy Loam'],
    },
    regenerativeAdvice: {
      recommendedCoverCrops: ['Chickpea intercrop', 'Lentil'],
      mulchingBenefit: 'Conserves residual monsoon moisture in rainfed arid regions.',
      naturalPestPredators: ['Chrysoperla carnea (Green lacewing)'],
    },
  },
  Soybean: {
    name: 'Soybean',
    botanicalName: 'Glycine max',
    season: 'Kharif',
    idealTempRange: { min: 20, max: 32 },
    waterRequirementMm: 500,
    criticalStagesForIrrigation: ['flowering', 'grain_fill'],
    commonDiseases: ['Yellow Mosaic Virus', 'Charcoal Rot', 'Rhizoctonia Aerial Blight'],
    soilPreferences: {
      minPh: 6.0,
      maxPh: 7.5,
      preferredTextures: ['Clay Loam', 'Loam'],
    },
    regenerativeAdvice: {
      recommendedCoverCrops: ['Sorghum-sudangrass', 'Millet'],
      mulchingBenefit: 'Fixes 50-100 kg atmospheric nitrogen per ha; residue improves soil organic carbon.',
      naturalPestPredators: ['Trichogramma wasps', 'Praying mantis'],
    },
  },
  Cotton: {
    name: 'Cotton',
    botanicalName: 'Gossypium hirsutum',
    season: 'Kharif',
    idealTempRange: { min: 21, max: 36 },
    waterRequirementMm: 700,
    criticalStagesForIrrigation: ['vegetative', 'flowering', 'grain_fill'],
    commonDiseases: ['Bacterial Blight', 'Grey Mildew', 'Root Rot', 'Leaf Curl Virus'],
    soilPreferences: {
      minPh: 6.5,
      maxPh: 8.0,
      preferredTextures: ['Black Cotton Soil (Deep Clay)', 'Loam'],
    },
    regenerativeAdvice: {
      recommendedCoverCrops: ['Marigold border (trap crop for bollworm)', 'Green gram'],
      mulchingBenefit: 'Reduces surface crusting in heavy black vertisol soils.',
      naturalPestPredators: ['Assassin bugs', 'Braconid wasps'],
    },
  },
};

export function getCropAgronomy(cropName: string): CropProfile {
  return CROP_PROFILES[cropName] || CROP_PROFILES.Wheat;
}
