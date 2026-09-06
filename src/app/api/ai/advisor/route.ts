import { NextRequest, NextResponse } from 'next/server';
import { orchestrateAgriIntelligence, askFarmerAdvisor } from '@/lib/ai/orchestrator';
import { FarmContext } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ctx, question, language } = body as { ctx?: FarmContext; question?: string; language?: string } & FarmContext;

    // Support ctx, farmContext, context, or direct farm object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let farmCtx: any = ctx || body.farmContext || body.context || (body.farm ? (body as FarmContext) : null);

    if (!farmCtx || !farmCtx.farm) {
      if (question && typeof question === 'string' && question.trim().length > 0) {
        farmCtx = {
          farm: {
            id: 'default-farm',
            name: 'General Farm Context',
            location: { latitude: 28.6139, longitude: 77.209, state: 'India', district: 'General' },
            sizeAcres: 5,
            primaryCrop: 'Crops',
            crops: ['Wheat', 'Rice', 'Pulses'],
            soilType: 'Loam',
            irrigationType: 'Canal',
          },
          weather: {
            temperature: 26,
            humidity: 60,
            rainfall: 0,
            forecast: [],
          },
          market: [],
          actions: [],
        };
      } else {
        return NextResponse.json({ error: 'Farm context is required' }, { status: 400 });
      }
    }

    if (question && typeof question === 'string' && question.trim().length > 0) {
      const qnaPromise = askFarmerAdvisor(farmCtx, question.trim(), language || 'en');
      const timeoutPromise = new Promise<{ answer: string; evidence: []; source: string }>((resolve) =>
        setTimeout(() => resolve({
          answer: language === 'hi'
            ? 'वर्तमान में एआई सेवा अधिक समय ले रही है। सामान्य कृषि सलाह: अपनी फसल की अवस्था के अनुसार उचित नमी बनाए रखें और कीट या बीमारी के लक्षणों के लिए खेत का निरीक्षण करें।'
            : 'AI response timed out. Standard agronomic guidance: Maintain recommended irrigation intervals according to crop growth stage and inspect for foliar symptoms.',
          evidence: [],
          source: 'AgriOS Local Fallback',
        }), 15000)
      );
      const qnaResult = await Promise.race([qnaPromise, timeoutPromise]);
      return NextResponse.json(qnaResult);
    }

    const recPromise = orchestrateAgriIntelligence(farmCtx);
    const recTimeoutPromise = new Promise<ReturnType<typeof orchestrateAgriIntelligence>>((_, reject) =>
      setTimeout(() => reject(new Error('AI Orchestrator Timeout')), 15000)
    );
    const recommendation = await Promise.race([recPromise, recTimeoutPromise]);
    return NextResponse.json(recommendation);
  } catch (err) {
    console.error('[AI Advisor API Error]', err);
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}

