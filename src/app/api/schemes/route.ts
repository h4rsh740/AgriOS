import { NextRequest, NextResponse } from 'next/server';
import { INDIAN_GOVERNMENT_SCHEMES, matchFarmerSchemes } from '@/lib/services/agriculture/schemeService';
import { Farm } from '@/types';

export async function GET() {
  return NextResponse.json({
    schemes: INDIAN_GOVERNMENT_SCHEMES,
    source: 'National Portal of India / Department of Agriculture & Farmers Welfare',
    retrievedAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const farm: Farm = await request.json();
    if (!farm || !farm.crop) {
      return NextResponse.json({ schemes: INDIAN_GOVERNMENT_SCHEMES });
    }
    const matched = matchFarmerSchemes(farm);
    return NextResponse.json({
      schemes: matched,
      matchedFor: { farm: farm.name, crop: farm.crop, state: farm.location.state },
      retrievedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ schemes: INDIAN_GOVERNMENT_SCHEMES });
  }
}
