import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageWithContext, AGRI_SYSTEM_PROMPT } from '@/lib/ai/gemini';
import { DiseaseAssessment } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const contextJson = formData.get('context') as string;
    const farmContext = JSON.parse(contextJson || '{}');

    let imageBase64: string | null = null;
    let mimeType = 'image/jpeg';

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      // Validate file type
      if (!image.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
      }
      if (buffer.length > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 });
      }
      imageBase64 = buffer.toString('base64');
      mimeType = image.type;
    }

    const prompt = `${AGRI_SYSTEM_PROMPT}

You are the AgriOS Disease Investigation Agent.

FARM CONTEXT:
- Crop: ${farmContext.crop || 'Unknown'}
- Crop Stage: ${farmContext.cropStage || 'Unknown'}
- Location: ${farmContext.location?.state || 'Unknown'}, ${farmContext.location?.country || 'Unknown'}
- Weather: ${farmContext.weather ? `${farmContext.weather.current.temperature}°C, ${farmContext.weather.current.humidity}% humidity, ${farmContext.weather.risks.diseaseRisk} disease risk` : 'Not available'}
- NDVI: ${farmContext.ndvi || 'Not available'}

${imageBase64 ? 'An image of the crop has been provided. Analyze it carefully.' : 'No image provided — assess based on context only.'}

Perform a comprehensive crop disease/stress investigation.

Return this EXACT JSON:
{
  "id": "assessment-${Date.now()}",
  "farmId": "${farmContext.farmId || 'unknown'}",
  "likelyIssue": "Most likely disease, pest, or stress condition name",
  "confidence": 72,
  "severity": "low|moderate|high|critical",
  "symptoms": ["symptom 1", "symptom 2"],
  "possibleCauses": ["cause 1", "cause 2"],
  "evidence": [
    {"type": "visual|weather|soil|satellite|crop_stage", "description": "evidence description"}
  ],
  "alternatives": ["Alternative diagnosis 1", "Alternative diagnosis 2"],
  "recommendedAction": "Specific, practical recommended action",
  "prevention": ["prevention step 1", "prevention step 2"],
  "verificationSteps": ["Field verification step 1", "step 2"],
  "needsFieldVerification": true,
  "disclaimer": "This is an AI-assisted assessment. Field verification by a qualified agronomist is recommended before applying any treatments.",
  "assessedAt": "${new Date().toISOString()}"
}

RULES: Be honest about uncertainty. If no image is provided, say so. Never recommend specific chemical dosages.`;

    let responseText: string;
    if (imageBase64) {
      responseText = await analyzeImageWithContext(imageBase64, mimeType, prompt);
    } else {
      const { generateText } = await import('@/lib/ai/gemini');
      responseText = await generateText(prompt);
    }

    // Parse JSON from response
    let assessment: DiseaseAssessment;
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      assessment = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
      assessment.isDemo = false;
    } catch {
      assessment = getDemoAssessment(farmContext);
    }

    return NextResponse.json(assessment);
  } catch (err) {
    console.error('[Disease API]', err);
    return NextResponse.json({ error: 'Disease analysis service unavailable' }, { status: 503 });
  }
}

function getDemoAssessment(ctx: Record<string, unknown>): DiseaseAssessment {
  return {
    id: `assessment-${Date.now()}`,
    farmId: (ctx.farmId as string) || 'demo',
    likelyIssue: 'Powdery Mildew (Blumeria graminis)',
    confidence: 68,
    severity: 'moderate',
    isDemo: true,
    symptoms: ['White powdery coating on leaves', 'Yellowing of affected leaf areas', 'Stunted growth in severely affected plants'],
    possibleCauses: ['High humidity (currently 72%)', 'Dense crop canopy limiting airflow', 'Susceptible variety under stress conditions'],
    evidence: [
      { type: 'weather', description: 'Current humidity 72% — above fungal disease threshold' },
      { type: 'crop_stage', description: 'Vegetative stage — high biomass creates favorable microclimate for fungal growth' },
    ],
    alternatives: ['Brown rust (Puccinia triticina)', 'Septoria leaf blotch', 'Nutrient deficiency chlorosis'],
    recommendedAction: 'Inspect 20-30 plants across the field for powdery white coating. If confirmed on >5% of plants, consult an agronomist for fungicide timing recommendations.',
    prevention: ['Ensure adequate plant spacing for airflow', 'Avoid excessive nitrogen fertilization', 'Remove and dispose of heavily infected plant material'],
    verificationSteps: [
      'Inspect lower canopy leaves first (disease starts there)',
      'Look for white/grey powdery coating — can be rubbed off',
      'Check multiple field zones, not just one area',
      'Photograph symptoms for expert consultation',
    ],
    needsFieldVerification: true,
    disclaimer: 'This is an AI-assisted assessment based on contextual data. Field verification by a qualified agronomist is strongly recommended before applying any treatments.',
    assessedAt: new Date().toISOString(),
  };
}
