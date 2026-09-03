import { NextResponse } from 'next/server';
import { DEMO_AGRIMESH_NODES } from '@/lib/demo/demoData';

export async function GET() {
  // AgriMesh nodes — simulated for MVP, clearly labeled
  return NextResponse.json({
    nodes: DEMO_AGRIMESH_NODES,
    totalContributions: DEMO_AGRIMESH_NODES.reduce((s, n) => s + n.contributionsCount, 0),
    activeNodes: DEMO_AGRIMESH_NODES.filter(n => n.status === 'active').length,
    isSimulated: true,
    disclaimer: 'Prototype cooperation network. All AgriMesh nodes are simulated for demonstration purposes.',
  });
}
