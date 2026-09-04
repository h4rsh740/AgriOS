import { NextRequest, NextResponse } from 'next/server';

export interface FarmerActionItem {
  id: string;
  farmId: string;
  title: string;
  reason: string;
  urgency: 'immediate' | 'today' | 'this_week' | 'this_month';
  status: 'pending' | 'completed' | 'dismissed';
  createdAt: string;
  completedAt?: string;
}

// In-memory store for session/demo actions
const actionStore: Map<string, FarmerActionItem[]> = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const farmId = searchParams.get('farmId') || 'demo-farm-001';

  const actions = actionStore.get(farmId) || [
    { id: 'act-1', farmId, title: 'Inspect lower leaves of 15 representative plants', reason: 'High humidity increases fungal pressure', urgency: 'today', status: 'pending', createdAt: new Date().toISOString() },
    { id: 'act-2', farmId, title: 'Clear drainage channels in low-lying field zones', reason: 'Incoming rain within 48h to prevent waterlogging', urgency: 'today', status: 'pending', createdAt: new Date().toISOString() },
    { id: 'act-3', farmId, title: 'Delay planned irrigation by 36 hours', reason: 'Conserve ground water given forecasted precipitation', urgency: 'today', status: 'pending', createdAt: new Date().toISOString() },
    { id: 'act-4', farmId, title: 'Check local APMC mandi arrivals before selling', reason: 'Wheat modal price is currently steady near MSP', urgency: 'this_week', status: 'pending', createdAt: new Date().toISOString() },
  ];

  return NextResponse.json({ actions });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionId, farmId, status, newAction } = body;

    const current = actionStore.get(farmId) || [];

    if (newAction) {
      const item: FarmerActionItem = {
        id: `act-${Date.now()}`,
        farmId,
        title: newAction.title || newAction.action,
        reason: newAction.reason || '',
        urgency: newAction.urgency || 'today',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      current.unshift(item);
      actionStore.set(farmId, current);
      return NextResponse.json({ success: true, action: item });
    }

    if (actionId && status) {
      const updated = current.map(a => a.id === actionId ? { ...a, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined } : a);
      actionStore.set(farmId, updated);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action payload' }, { status: 400 });
  } catch (err) {
    console.error('[Actions API Error]', err);
    return NextResponse.json({ error: 'Failed to update action' }, { status: 500 });
  }
}
