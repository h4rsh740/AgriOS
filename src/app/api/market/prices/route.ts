import { NextRequest, NextResponse } from 'next/server';
import { fetchMandiPrices } from '@/lib/services/agriculture/marketService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get('crop') || 'Wheat';
  const state = searchParams.get('state') || undefined;

  try {
    const marketData = await fetchMandiPrices(crop, state);
    return NextResponse.json(marketData);
  } catch (err) {
    console.error('[API Mandi Prices Error]', err);
    return NextResponse.json({ error: 'Market data service temporarily unavailable' }, { status: 503 });
  }
}
