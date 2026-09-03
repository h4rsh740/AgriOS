import { NextRequest, NextResponse } from 'next/server';
import { calculateRegenerativeScore } from '@/lib/regenerative/scoreCalculator';

export async function POST(request: NextRequest) {
  try {
    const { farm, soil, weather, satellite } = await request.json();
    if (!farm) return NextResponse.json({ error: 'farm is required' }, { status: 400 });

    const score = calculateRegenerativeScore({ farm, soil, weather, satellite });
    return NextResponse.json(score);
  } catch (err) {
    console.error('[Regenerative Score API]', err);
    return NextResponse.json({ error: 'Score calculation unavailable' }, { status: 503 });
  }
}
