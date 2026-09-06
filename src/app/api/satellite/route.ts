import { NextRequest, NextResponse } from 'next/server';
import { fetchNDVI } from '@/lib/satellite/earthengine';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farmId') || 'demo-farm-01';
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');

  try {
    const data = await fetchNDVI(farmId, isNaN(lat) ? 28.6139 : lat, isNaN(lng) ? 77.2090 : lng);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Satellite service unavailable' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const farmId = body.farmId || 'demo-farm-01';
    const lat = typeof body.lat === 'number' ? body.lat : 28.6139;
    const lng = typeof body.lng === 'number' ? body.lng : 77.2090;

    const data = await fetchNDVI(farmId, lat, lng);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Satellite service unavailable' }, { status: 503 });
  }
}
