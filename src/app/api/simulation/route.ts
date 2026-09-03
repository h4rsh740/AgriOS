import { NextRequest, NextResponse } from 'next/server';
import { runSimulation } from '@/lib/simulation/scenarioEngine';
import { Farm } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { farm, customParams } = await request.json() as { farm: Farm; customParams?: Record<string, unknown> };
    if (!farm) return NextResponse.json({ error: 'farm is required' }, { status: 400 });

    const result = runSimulation(farm, customParams);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Simulation API]', err);
    return NextResponse.json({ error: 'Simulation service unavailable' }, { status: 503 });
  }
}
