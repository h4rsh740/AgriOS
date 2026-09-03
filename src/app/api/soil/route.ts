import { NextRequest, NextResponse } from 'next/server';
import { fetchSoilData } from '@/lib/soil/soilgrids';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  try {
    const data = await fetchSoilData(lat, lng);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Soil service unavailable' }, { status: 503 });
  }
}
