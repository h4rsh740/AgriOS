// ============================================================
// AgriOS — Google Cloud Speech-to-Text API
// Server-side transcription supporting hi-IN and en-IN
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioBase64, languageCode = 'hi-IN', encoding = 'WEBM_OPUS', sampleRateHertz = 48000 } = body;

    if (!audioBase64) {
      return NextResponse.json({ error: 'audioBase64 is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (apiKey) {
      const gcpUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;
      const gcpRes = await fetch(gcpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            encoding,
            sampleRateHertz,
            languageCode,
            alternativeLanguageCodes: languageCode === 'hi-IN' ? ['en-IN'] : ['hi-IN'],
            enableAutomaticPunctuation: true,
            model: 'command_and_search',
          },
          audio: {
            content: audioBase64,
          },
        }),
      });

      if (gcpRes.ok) {
        const data = await gcpRes.json();
        const transcript = data.results?.map((r: { alternatives?: { transcript?: string }[] }) => r.alternatives?.[0]?.transcript).filter(Boolean).join(' ');
        if (transcript) {
          return NextResponse.json({
            transcript,
            languageCode,
            source: 'Google Cloud Speech-to-Text',
            isDemo: false,
          });
        }
      }
    }

    // When GOOGLE_CLOUD_API_KEY is not configured
    return NextResponse.json({
      transcript: null,
      message: 'Google Cloud Speech API key is not configured. Falling back to browser Web Speech Recognition.',
      useWebSpeechFallback: true,
      isDemo: true,
    });
  } catch (err) {
    console.error('[STT API Error]', err);
    return NextResponse.json({ error: 'Speech-to-Text service error' }, { status: 500 });
  }
}
