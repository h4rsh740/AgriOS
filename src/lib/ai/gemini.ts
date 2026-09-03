// ============================================================
// AgriOS — Gemini AI Client
// All Gemini calls are server-side only (API route)
// Model configured via GEMINI_MODEL env var
// ============================================================
import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';

let _client: GoogleGenerativeAI | null = null;
let _model: GenerativeModel | null = null;

function getClient(): GoogleGenerativeAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    _client = new GoogleGenerativeAI(apiKey);
  }
  return _client;
}

function getModel(): GenerativeModel {
  if (!_model) {
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    _model = getClient().getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    });
  }
  return _model;
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try to extract JSON from markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1]) as T;
    throw new Error(`Failed to parse Gemini JSON response: ${text.slice(0, 200)}`);
  }
}

export async function generateText(prompt: string): Promise<string> {
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const client = getClient();
  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function analyzeImageWithContext(
  imageBase64: string,
  mimeType: string,
  textPrompt: string
): Promise<string> {
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const client = getClient();
  const model = client.getGenerativeModel({ model: modelName });

  const imagePart: Part = {
    inlineData: { data: imageBase64, mimeType },
  };

  const result = await model.generateContent([textPrompt, imagePart]);
  return result.response.text();
}

// System prompt for all agricultural AI calls
export const AGRI_SYSTEM_PROMPT = `You are AgriOS's agricultural intelligence system. You are NOT a general chatbot.

CRITICAL RULES:
1. Only reason over data explicitly provided in the context. Do NOT invent sensor readings.
2. If data is missing or uncertain, say so explicitly in the output.
3. Distinguish observation (what data shows) from inference (what it might mean).
4. Always include confidence levels (0-100) based on evidence quality.
5. Never prescribe specific chemical dosages or dangerous interventions.
6. Always recommend field verification for disease or pest identification.
7. Label all estimates as estimates, not facts.
8. Prioritize farmer safety and practical actionability.
9. Use simple, farmer-friendly language in summaries.
10. Technical details should be available but not the first thing a farmer sees.

You must return valid JSON matching the schema provided.`;
