import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, AGRI_SYSTEM_PROMPT } from '@/lib/ai/gemini';
import { FarmContext, RegenerativeRoadmap } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const ctx: FarmContext = await request.json();
    if (!ctx.farm) return NextResponse.json({ error: 'farm context required' }, { status: 400 });

    const prompt = `${AGRI_SYSTEM_PROMPT}

You are the AgriOS Regenerative Roadmap Agent.

FARM: ${ctx.farm.name}, ${ctx.farm.crop}, ${ctx.farm.cropStage} stage, ${ctx.farm.areaHa}ha
LOCATION: ${ctx.farm.location.state || ''}, ${ctx.farm.location.country}
PRACTICE: ${ctx.farm.farmingPractice}
IRRIGATION: ${ctx.farm.irrigationType}
SOIL: ${ctx.soil ? `pH ${ctx.soil.ph}, SOC ${ctx.soil.organicCarbon}g/kg` : 'not available'}
WEATHER RISKS: ${ctx.weather ? JSON.stringify(ctx.weather.risks) : 'not available'}
NDVI: ${ctx.satellite?.ndvi || 'not available'} (${ctx.satellite?.trend || 'unknown'} trend)

Generate a practical 90-day regenerative agriculture roadmap in 3 phases.

Return EXACT JSON:
{
  "farmId": "${ctx.farm.id}",
  "phases": [
    {
      "phase": 1,
      "label": "Immediate Actions",
      "startDay": 1,
      "endDay": 30,
      "focus": "Focus description",
      "actions": [
        {
          "action": "specific action",
          "why": "evidence-based reason",
          "expectedBenefit": "expected outcome",
          "effort": "low|medium|high",
          "risk": "low|medium|high",
          "confidence": 75,
          "category": "soil|water|crop|pest|biodiversity|input|monitoring"
        }
      ]
    },
    {"phase": 2, "label": "Short-term Investments", "startDay": 31, "endDay": 60, "focus": "...", "actions": []},
    {"phase": 3, "label": "Sustainable Transitions", "startDay": 61, "endDay": 90, "focus": "...", "actions": []}
  ],
  "overallGoal": "clear 90-day goal statement",
  "expectedOutcomes": ["outcome 1", "outcome 2"],
  "generatedAt": "${new Date().toISOString()}",
  "disclaimer": "AI-generated roadmap. Review with local agronomist before major investments. Results vary by location and conditions."
}

Include 3-4 actions per phase. Be specific and practical, not generic.`;

    try {
      const roadmap = await generateJSON<RegenerativeRoadmap>(prompt);
      return NextResponse.json(roadmap);
    } catch {
      return NextResponse.json(getDemoRoadmap(ctx.farm.id));
    }
  } catch (err) {
    console.error('[Roadmap API]', err);
    return NextResponse.json({ error: 'Roadmap generation unavailable' }, { status: 503 });
  }
}

function getDemoRoadmap(farmId: string): RegenerativeRoadmap {
  return {
    farmId,
    phases: [
      {
        phase: 1, label: 'Immediate Actions', startDay: 1, endDay: 30,
        focus: 'Stabilize crop health and optimize current season inputs',
        actions: [
          { action: 'Conduct comprehensive field inspection for disease and pest pressure', why: 'High humidity creates disease risk — early detection prevents major losses', expectedBenefit: 'Prevent 15-25% yield loss from undetected disease', effort: 'low', risk: 'low', confidence: 82, category: 'monitoring' },
          { action: 'Optimize irrigation scheduling using weather forecast', why: 'Rainfall expected in 36-48 hours — avoid over-irrigation', expectedBenefit: 'Reduce water use 10-15%, prevent waterlogging', effort: 'low', risk: 'low', confidence: 88, category: 'water' },
          { action: 'Apply foliar micronutrient supplement if leaf yellowing observed', why: 'Alkaline pH (7.8) reduces iron and manganese availability', expectedBenefit: 'Restore leaf greenness, improve photosynthesis efficiency', effort: 'medium', risk: 'low', confidence: 70, category: 'soil' },
          { action: 'Map field zones with drainage issues for post-harvest improvement', why: 'Pre-harvest planning prevents waterlogging in next season', expectedBenefit: 'Reduce crop loss from waterlogging 5-10% next season', effort: 'low', risk: 'low', confidence: 75, category: 'monitoring' },
        ],
      },
      {
        phase: 2, label: 'Short-term Investments', startDay: 31, endDay: 60,
        focus: 'Begin soil health improvement and prepare for crop rotation',
        actions: [
          { action: 'Plan cover crop selection for post-harvest planting', why: 'Low organic carbon (0.48 g/kg) can be improved by cover crops', expectedBenefit: 'Add 0.2-0.4 g/kg organic carbon per year', effort: 'medium', risk: 'low', confidence: 80, category: 'soil' },
          { action: 'Order compost or vermicompost for post-harvest soil application', why: 'Building organic matter requires advance planning', expectedBenefit: 'Improve water retention, soil biology, and future yields', effort: 'medium', risk: 'low', confidence: 78, category: 'soil' },
          { action: 'Research and select next season crop (legume rotation)', why: 'Legume in rotation fixes nitrogen and breaks pest cycles', expectedBenefit: 'Reduce nitrogen fertilizer cost 20-30% in following year', effort: 'low', risk: 'low', confidence: 75, category: 'crop' },
          { action: 'Install or repair drip irrigation in low-efficiency zones', why: 'Water efficiency improvements have multi-season ROI', expectedBenefit: 'Reduce water use 25-40% vs flood irrigation', effort: 'high', risk: 'low', confidence: 85, category: 'water' },
        ],
      },
      {
        phase: 3, label: 'Sustainable Transitions', startDay: 61, endDay: 90,
        focus: 'Post-harvest transitions for long-term regenerative system',
        actions: [
          { action: 'Plant selected cover crop after wheat harvest', why: 'Prevents soil erosion, adds organic matter, supports beneficial insects', expectedBenefit: 'Measurable soil health improvement within 1 growing season', effort: 'medium', risk: 'low', confidence: 80, category: 'biodiversity' },
          { action: 'Reduce tillage depth for next season preparation', why: 'Reduced tillage preserves soil structure and biology', expectedBenefit: 'Reduce fuel cost 10-15%, improve soil structure', effort: 'medium', risk: 'medium', confidence: 72, category: 'soil' },
          { action: 'Apply compost at 2-3 tons/ha before next crop planting', why: 'Organic matter amendment builds long-term soil fertility', expectedBenefit: 'Improve soil carbon, water retention, and biological activity', effort: 'high', risk: 'low', confidence: 82, category: 'soil' },
          { action: 'Establish field-edge biodiversity strips (native plants)', why: 'Beneficial insects reduce pest pressure naturally', expectedBenefit: 'Reduce pesticide costs 10-20% over 2-3 seasons', effort: 'low', risk: 'low', confidence: 68, category: 'biodiversity' },
        ],
      },
    ],
    overallGoal: 'Transform from conventional wheat farming toward a regenerative system with improved soil health, reduced input dependency, and greater climate resilience over the next 90 days.',
    expectedOutcomes: [
      'Soil organic carbon trajectory toward +0.3 g/kg within 12 months',
      'Water use reduction of 15-25%',
      'Reduction in external fertilizer dependency',
      'Improved biodiversity and beneficial insect populations',
    ],
    generatedAt: new Date().toISOString(),
    disclaimer: 'AI-generated regenerative roadmap. Review with a qualified local agronomist before making major investments. Outcomes vary significantly by location, soil type, and implementation quality.',
  };
}
