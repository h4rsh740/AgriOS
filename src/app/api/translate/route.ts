// ============================================================
// AgriOS — Google Cloud Translation API & Agricultural Dictionary
// Bilingual support: Hindi (hi) and English (en)
// ============================================================
import { NextRequest, NextResponse } from 'next/server';

// Common agricultural terminology dictionary for instantaneous translation and offline resilience
const AGRI_DICTIONARY: Record<string, string> = {
  'Wheat': 'गेहूं',
  'Rice': 'चावल / धान',
  'Mustard': 'सरसों',
  'Soybean': 'सोयाबीन',
  'Cotton': 'कपास',
  'Sugarcane': 'गन्ना',
  'Maize': 'मक्का',
  'Potato': 'आलू',
  'Tomato': 'टमाटर',
  'Vegetative': 'वानस्पतिक वृद्धि',
  'Flowering': 'फूल आना',
  'Germination': 'अंकुरण',
  'Grain Fill': 'दाना भरना',
  'Maturity': 'परिपक्वता',
  'Rainfed': 'वर्षा आधारित',
  'Drip': 'ड्रिप सिंचाई',
  'Sprinkler': 'फव्वारा सिंचाई',
  'Flood': 'बाढ़ सिंचाई',
  'Canal': 'नहर',
  'Borewell': 'बोरवेल',
  'Soil Health': 'मृदा स्वास्थ्य',
  'Organic Carbon': 'जैविक कार्बन',
  'Weather Intelligence': 'मौसम की जानकारी',
  'Vegetation Signal': 'वनस्पति संकेत (NDVI)',
  'Disease Risk': 'रोग का जोखिम',
  'Heat Stress': 'गर्मी का तनाव',
  'Irrigation': 'सिंचाई',
  'Government Schemes': 'सरकारी योजनाएं',
  'Mandi Prices': 'मंडी भाव',
  'Today\'s Actions': 'आज के आवश्यक कार्य',
  'Low Risk': 'कम जोखिम',
  'Medium Risk': 'मध्यम जोखिम',
  'High Risk': 'उच्च जोखिम',
  'Critical': 'गंभीर',
};

const REVERSE_AGRI_DICTIONARY: Record<string, string> = Object.entries(AGRI_DICTIONARY).reduce(
  (acc, [en, hi]) => {
    acc[hi] = en;
    return acc;
  },
  {} as Record<string, string>
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, target = 'hi', source = 'en' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    // 1. Direct dictionary match if applicable
    const trimmed = text.trim();
    if (target === 'hi' && AGRI_DICTIONARY[trimmed]) {
      return NextResponse.json({
        translatedText: AGRI_DICTIONARY[trimmed],
        sourceLanguage: 'en',
        targetLanguage: 'hi',
        source: 'AgriOS Bilingual Lexicon',
        isDemo: false,
      });
    }
    if (target === 'en' && REVERSE_AGRI_DICTIONARY[trimmed]) {
      return NextResponse.json({
        translatedText: REVERSE_AGRI_DICTIONARY[trimmed],
        sourceLanguage: 'hi',
        targetLanguage: 'en',
        source: 'AgriOS Bilingual Lexicon',
        isDemo: false,
      });
    }

    // 2. Google Cloud Translation API if configured
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (apiKey) {
      const gcpUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      const gcpRes = await fetch(gcpUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          target,
          source,
          format: 'text',
        }),
      });

      if (gcpRes.ok) {
        const data = await gcpRes.json();
        const translatedText = data.data?.translations?.[0]?.translatedText;
        if (translatedText) {
          return NextResponse.json({
            translatedText,
            sourceLanguage: source,
            targetLanguage: target,
            source: 'Google Cloud Translation API',
            isDemo: false,
          });
        }
      }
    }

    // 3. Fallback: return original text with clear notice
    return NextResponse.json({
      translatedText: text,
      sourceLanguage: source,
      targetLanguage: target,
      message: 'Google Cloud Translation key not configured. Displaying base text.',
      isDemo: true,
    });
  } catch (err) {
    console.error('[Translation API Error]', err);
    return NextResponse.json({ error: 'Translation service error' }, { status: 500 });
  }
}
