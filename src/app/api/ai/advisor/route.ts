import { NextRequest, NextResponse } from 'next/server';
import { orchestrateAgriIntelligence } from '@/lib/ai/orchestrator';
import { FarmContext } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const ctx: FarmContext = await request.json();
    if (!ctx.farm) return NextResponse.json({ error: 'farm context required' }, { status: 400 });

    const recommendation = await orchestrateAgriIntelligence(ctx);
    return NextResponse.json(recommendation);
  } catch (err) {
    console.error('[AI Advisor API]', err);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
