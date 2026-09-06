import { NextRequest, NextResponse } from 'next/server';
import { runSimulation } from '@/lib/simulation/scenarioEngine';
import { Farm } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const farm: Farm = body.farm || {
      id: body.farmId || 'default-farm',
      name: body.farmName || 'General Farm',
      ownerId: 'demo-user',
      location: { latitude: 28.6139, longitude: 77.209, state: 'Punjab', country: 'India', district: 'Ludhiana' },
      areaHa: body.areaHa || 2.5,
      crop: body.crop || 'Wheat',
      cropStage: 'vegetative',
      irrigationType: 'drip',
      farmingPractice: 'conventional',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = runSimulation(farm, body.customParams);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Simulation API]', err);
    return NextResponse.json({ error: 'Simulation service unavailable' }, { status: 503 });
  }
}
