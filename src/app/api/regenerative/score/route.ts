import { NextRequest, NextResponse } from 'next/server';
import { calculateRegenerativeScore } from '@/lib/regenerative/scoreCalculator';
import { DEMO_FARM, DEMO_SOIL, DEMO_WEATHER, DEMO_SATELLITE } from '@/lib/demo/demoData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get('farmId') || 'demo-farm-001';
    const farm = { ...DEMO_FARM, id: farmId };
    const score = calculateRegenerativeScore({
      farm,
      soil: DEMO_SOIL,
      weather: DEMO_WEATHER,
      satellite: DEMO_SATELLITE,
    });
    return NextResponse.json(score);
  } catch (err) {
    console.error('[Regenerative Score GET API]', err);
    return NextResponse.json({ error: 'Score calculation unavailable' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const farm = body.farm || DEMO_FARM;
    const soil = body.soil !== undefined ? body.soil : DEMO_SOIL;
    const weather = body.weather !== undefined ? body.weather : DEMO_WEATHER;
    const satellite = body.satellite !== undefined ? body.satellite : DEMO_SATELLITE;

    const score = calculateRegenerativeScore({ farm, soil, weather, satellite });
    return NextResponse.json(score);
  } catch (err) {
    console.error('[Regenerative Score API]', err);
    return NextResponse.json({ error: 'Score calculation unavailable' }, { status: 503 });
  }
}
