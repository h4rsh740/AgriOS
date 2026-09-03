import { NextRequest, NextResponse } from 'next/server';
import { fetchNDVI } from '@/lib/satellite/earthengine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farmId');
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');

  if (!farmId || isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'farmId, lat and lng are required' }, { status: 400 });
  }

  try {
    // GEE will use lat/lng once wired up; the MVP key is farmId (demo fallback).
    const data = await fetchNDVI(farmId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Satellite service unavailable' }, { status: 503 });
  }
}
