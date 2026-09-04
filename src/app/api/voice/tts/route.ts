// ============================================================
// AgriOS — Google Cloud Text-to-Speech API
// Neural2 high-fidelity Indian voices (hi-IN & en-IN)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, languageCode = 'hi-IN', gender = 'FEMALE' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (apiKey) {
      const gcpUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
      const voiceName = languageCode === 'hi-IN' ? 'hi-IN-Neural2-A' : 'en-IN-Neural2-A';

      const gcpRes = await fetch(gcpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name: voiceName,
            ssmlGender: gender,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.95,
            pitch: 0.0,
          },
        }),
      });

      if (gcpRes.ok) {
        const data = await gcpRes.json();
        if (data.audioContent) {
          return NextResponse.json({
            audioContent: data.audioContent,
            contentType: 'audio/mp3',
            source: 'Google Cloud Text-to-Speech (Neural2)',
            isDemo: false,
          });
        }
      }
    }

    // Honest fallback instruction
    return NextResponse.json({
      audioContent: null,
      message: 'Google Cloud TTS API key not configured. Using client-side Web SpeechSynthesis.',
      useWebSpeechFallback: true,
      text,
      languageCode,
      isDemo: true,
    });
  } catch (err) {
    console.error('[TTS API Error]', err);
    return NextResponse.json({ error: 'Text-to-Speech service error' }, { status: 500 });
  }
}
