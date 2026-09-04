import { NextResponse } from 'next/server';

export async function GET() {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10);
  const firebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const googleCloudConfigured = Boolean(process.env.GOOGLE_CLOUD_PROJECT_ID);
  const dataGovConfigured = Boolean(process.env.DATA_GOV_IN_API_KEY);

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'AgriOS Agricultural Intelligence Engine',
    integrations: {
      gemini: geminiConfigured ? 'configured' : 'unconfigured',
      firebase: firebaseConfigured ? 'configured' : 'offline_demo_mode',
      googleCloud: googleCloudConfigured ? 'configured' : 'unconfigured',
      dataGovIn: dataGovConfigured ? 'configured' : 'benchmark_fallback',
      openMeteo: 'active',
      soilGrids: 'active',
    },
  });
}
