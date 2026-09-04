import { NextRequest, NextResponse } from 'next/server';
import { orchestrateAgriIntelligence, askFarmerAdvisor } from '@/lib/ai/orchestrator';
import { FarmContext } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ctx, question, language } = body as { ctx?: FarmContext; question?: string; language?: string } & FarmContext;

    const farmCtx = ctx || (body.farm ? (body as FarmContext) : null);
    if (!farmCtx || !farmCtx.farm) {
      return NextResponse.json({ error: 'Farm context is required' }, { status: 400 });
    }

    if (question && typeof question === 'string' && question.trim().length > 0) {
      const qnaResult = await askFarmerAdvisor(farmCtx, question.trim(), language || 'en');
      return NextResponse.json(qnaResult);
    }

    const recommendation = await orchestrateAgriIntelligence(farmCtx);
    return NextResponse.json(recommendation);
  } catch (err) {
    console.error('[AI Advisor API Error]', err);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}

