import { NextRequest, NextResponse } from 'next/server';
import { FarmAlert } from '@/types';
import { fetchWeather } from '@/lib/weather/openmeteo';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farmId') || 'demo-farm-001';
  const lat = parseFloat(searchParams.get('lat') || '26.85');
  const lng = parseFloat(searchParams.get('lng') || '80.95');

  const alerts: FarmAlert[] = [];

  try {
    const weather = await fetchWeather(lat, lng);

    if (weather.risks.diseaseRisk === 'high' || weather.risks.diseaseRisk === 'critical') {
      alerts.push({
        id: `alert-disease-${farmId}`,
        farmId,
        type: 'disease_risk',
        severity: weather.risks.diseaseRisk === 'critical' ? 'critical' : 'warning',
        title: 'Elevated Foliar Disease Risk',
        message: `High ambient humidity (${weather.current.humidity}%) creates favorable microclimate for fungal infection.`,
        recommendedAction: 'Inspect lower leaf canopy for mildew or rust signs tomorrow morning.',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    const rain3Day = weather.forecast.slice(0, 3).reduce((s, d) => s + d.precipitation, 0);
    if (rain3Day > 15) {
      alerts.push({
        id: `alert-rain-${farmId}`,
        farmId,
        type: 'heavy_rainfall',
        severity: 'warning',
        title: 'Heavy Rainfall Warning',
        message: `${rain3Day.toFixed(1)}mm rainfall projected over the next 72 hours.`,
        recommendedAction: 'Check drainage channels and temporarily pause planned irrigation and chemical spraying.',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    if (weather.risks.heatStress === 'high' || weather.risks.heatStress === 'critical') {
      alerts.push({
        id: `alert-heat-${farmId}`,
        farmId,
        type: 'heat_stress',
        severity: 'critical',
        title: 'Extreme Heat Advisory',
        message: `Temperatures exceeding optimal threshold for vegetative growth.`,
        recommendedAction: 'Provide light evening irrigation to moderate root zone temperature.',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
  } catch (err) {
    console.warn('[Alerts API] Could not fetch real-time weather telemetry for alerts:', err);
  }

  // If no meteorological alerts were triggered, provide an informational advisory
  if (alerts.length === 0) {
    alerts.push({
      id: `alert-info-${farmId}`,
      farmId,
      type: 'irrigation_stress',
      severity: 'info',
      title: 'Normal Operational Conditions',
      message: 'Weather and field conditions are currently stable. Good window for crop monitoring.',
      recommendedAction: 'Continue scheduled field routine.',
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  return NextResponse.json({ alerts });
}
