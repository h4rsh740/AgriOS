// ============================================================
// AgriOS — Sensor Contradiction & Telemetry Dispute Engine
// Evaluates multi-source telemetry across weather, soil, satellite,
// and crop phenology to catch conflicting physical signals.
// Implements explicit confidence penalties on contradictory states.
// ============================================================
import type { FarmContext, SensorContradiction } from '@/types';

/**
 * Cross-sensor contradiction and telemetry dispute detection.
 * Evaluates multi-source telemetry across weather, soil, satellite, and crop stage
 * to catch conflicting physical signals before issuing recommendations.
 */
export function detectSensorContradictions(ctx: FarmContext): SensorContradiction[] {
  const contradictions: SensorContradiction[] = [];

  // 1. Weather Forecast vs. Farm Irrigation Practice
  if (ctx.weather && ctx.farm.irrigationType !== 'rainfed') {
    const upcomingRain = ctx.weather.forecast.slice(0, 3).reduce((s, d) => s + d.precipitation, 0);
    if (upcomingRain >= 8) {
      contradictions.push({
        sourceA: 'Open-Meteo Forecast (Precipitation)',
        sourceB: `Farm Irrigation (${ctx.farm.irrigationType})`,
        conflict: `${upcomingRain.toFixed(1)}mm rainfall forecasted in next 72h while active ${ctx.farm.irrigationType} irrigation is scheduled.`,
        severity: 'high',
        resolutionAdvice: 'Immediately halt active irrigation cycles to prevent root zone saturation, root hypoxia, and fertilizer leaching.',
      });
    }
  }

  // 2. Satellite NDVI vs. Soil Degradation / Crop Stage
  if (ctx.satellite && ctx.soil) {
    if (ctx.satellite.ndvi > 0.65 && ctx.soil.organicCarbon < 0.5) {
      contradictions.push({
        sourceA: `Sentinel-2 NDVI (${ctx.satellite.ndvi.toFixed(2)})`,
        sourceB: `ISRIC SoilGrids SOC (${ctx.soil.organicCarbon} g/kg)`,
        conflict: 'High canopy vegetative vigor detected over severely depleted soil organic matter reserves.',
        severity: 'medium',
        resolutionAdvice: 'Canopy vigor is likely artificial from high chemical inputs; soil lacks biological buffering. Prioritize organic carbon inputs.',
      });
    }

    if (ctx.satellite.ndvi < 0.35 && ['flowering', 'grain_fill', 'vegetative'].includes(ctx.farm.cropStage)) {
      contradictions.push({
        sourceA: `Sentinel-2 NDVI (${ctx.satellite.ndvi.toFixed(2)})`,
        sourceB: `Crop Phenology Stage (${ctx.farm.cropStage})`,
        conflict: `Severe canopy reflectance deficit (< 0.35) during peak vegetative/reproductive phase.`,
        severity: 'high',
        resolutionAdvice: 'Perform urgent ground truthing: check for localized foliar disease, pest swarm, or subterranean nematode damage.',
      });
    }
  }

  // 3. Extreme Atmospheric Heat vs. Microclimate Humidity Divergence
  if (ctx.weather) {
    const { current } = ctx.weather;
    if (current.temperature >= 37 && current.humidity >= 65) {
      contradictions.push({
        sourceA: `Ambient Temperature (${current.temperature}°C)`,
        sourceB: `Relative Humidity (${current.humidity}%)`,
        conflict: 'Extreme wet-bulb microclimate: intense heat coincides with saturated ambient humidity.',
        severity: 'high',
        resolutionAdvice: 'Plant stomata likely closed from thermal distress, preventing transpiration. Postpone any foliar spray until cool evening hours.',
      });
    }
  }

  // 4. Alkaline Soil vs. Nutrient Uptake in Field
  if (ctx.soil && ctx.soil.ph > 8.0) {
    contradictions.push({
      sourceA: `SoilGrids pH (${ctx.soil.ph})`,
      sourceB: `Crop Agronomy (${ctx.farm.crop})`,
      conflict: `High soil alkalinity (pH ${ctx.soil.ph}) creates micronutrient fixation risk.`,
      severity: 'medium',
      resolutionAdvice: 'Zinc and iron availability are severely suppressed at pH > 8.0. Use chelated micronutrients rather than soil-applied salts.',
    });
  }

  return contradictions;
}
