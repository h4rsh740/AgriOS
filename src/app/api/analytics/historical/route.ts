// ============================================================
// AgriOS — BigQuery Historical Analytics API
// Multi-year mandi price & arrival volume trends
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { queryHistoricalPriceTrends } from '@/lib/services/agriculture/bigQueryService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get('crop') || 'Wheat';
    const state = searchParams.get('state') || 'Uttar Pradesh';

    const result = await queryHistoricalPriceTrends(crop, state);

    return NextResponse.json({
      success: true,
      crop,
      state,
      ...result,
    });
  } catch (error) {
    console.error('[BigQuery API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve BigQuery historical analytics' },
      { status: 500 }
    );
  }
}
