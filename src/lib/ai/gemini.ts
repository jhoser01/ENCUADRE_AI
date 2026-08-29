/**
 * gemini.ts
 * Google Gemini multimodal VisionProvider implementation.
 * Validates all outputs with Zod. Includes bounded retries, timeouts, and safe fallbacks.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiAnalysisResponseSchema, aiBriefResponseSchema } from '@/schemas';
import type { VisionProvider, AnalyzeImageInput, ImageFeatureResult, BriefInput, BriefResult } from './types';
import type { ImageFeatureVector, BriefContent } from '@/types/database';

const MODEL_NAME = process.env.AI_VISION_MODEL || 'gemini-2.0-flash';
const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

export class GeminiVisionProvider implements VisionProvider {
  private client: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY or AI_API_KEY is not configured in environment.');
      }
      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  async analyzeImage(input: AnalyzeImageInput): Promise<ImageFeatureResult> {
    const client = this.getClient();
    const model = client.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const prompt = `Analyze this photograph for a professional photography style profiling system.
Evaluate the visual characteristics and output ONLY a JSON object where each key has a float value between 0.0 and 1.0:

{
  "warmth": 0.0,             // 0.0 = very cool/blue tones, 1.0 = very warm/golden tones
  "brightness": 0.0,         // 0.0 = low-key/dark/shadowy, 1.0 = high-key/bright/airy
  "contrast": 0.0,           // 0.0 = flat/low contrast, 1.0 = punchy/high contrast
  "saturation": 0.0,         // 0.0 = muted/desaturated/BW, 1.0 = vivid/saturated colors
  "naturalLight": 0.0,       // 0.0 = flash/studio/artificial, 1.0 = pure natural window/sun light
  "candidness": 0.0,         // 0.0 = strictly posed, 1.0 = completely candid/unposed moment
  "posedness": 0.0,          // 0.0 = unguided/spontaneous, 1.0 = formal/directed pose
  "editorialness": 0.0,      // 0.0 = snapshot/casual, 1.0 = high fashion/vogue/commercial editorial
  "documentaryness": 0.0,    // 0.0 = staged/styled, 1.0 = photojournalistic/storytelling
  "intimacy": 0.0,           // 0.0 = distant/impersonal, 1.0 = close-up/deep emotional connection
  "wideComposition": 0.0,    // 0.0 = tight close-up, 1.0 = wide environmental landscape
  "retouchLevel": 0.0,       // 0.0 = raw/natural skin texture, 1.0 = heavy airbrush/high-end retouch
  "emotionalIntensity": 0.0, // 0.0 = quiet/subdued/neutral, 1.0 = intense laughter/crying/drama
  "minimalism": 0.0          // 0.0 = busy/cluttered background, 1.0 = clean/minimalist composition
}

Output ONLY the JSON object with 14 float numbers between 0.0 and 1.0.`;

    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Fetch image bytes to pass as inline data
        const imageRes = await fetchWithTimeout(input.imageUrl, TIMEOUT_MS);
        if (!imageRes.ok) {
          throw new Error(`Failed to fetch image from URL (${imageRes.status}): ${input.imageUrl}`);
        }
        const imageBuffer = await imageRes.arrayBuffer();
        const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
        const base64Data = Buffer.from(imageBuffer).toString('base64');

        const result = await Promise.race([
          model.generateContent([
            prompt,
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
          ]),
          createTimeout(TIMEOUT_MS),
        ]);

        const rawText = result.response.text();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Gemini did not return valid JSON block.');
        }

        const parsedJson = JSON.parse(jsonMatch[0]);
        const validatedFeatures = aiAnalysisResponseSchema.parse(parsedJson);

        const confidence: Record<string, number> = {};
        for (const key of Object.keys(validatedFeatures)) {
          confidence[key] = 0.95;
        }

        return {
          features: validatedFeatures as ImageFeatureVector,
          confidence,
          algorithm_version: 'gemini-2.0-flash-v1',
        };
      } catch (err) {
        lastError = err;
        console.warn(`[GeminiVisionProvider] analyzeImage attempt ${attempt}/${MAX_RETRIES} failed:`, err);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
        }
      }
    }

    // Fallback if all retries fail: return neutral vector with low confidence
    console.error('[GeminiVisionProvider] All analyzeImage attempts failed. Returning neutral fallback.', lastError);
    return {
      features: getNeutralVector(),
      confidence: getLowConfidence(),
      algorithm_version: 'fallback-v1',
    };
  }

  async generateBrief(input: BriefInput): Promise<BriefResult> {
    const client = this.getClient();
    const model = client.getGenerativeModel({
      model: process.env.AI_TEXT_MODEL || MODEL_NAME,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const prompt = `You are the Creative Director at ENCUADRE, a platform that aligns photography vision between photographer and client BEFORE the shoot.

Based ONLY on the provided session data, generate a clear, collaborative Visual Brief JSON.

CONTEXT DATA:
- Alignment Score: ${input.alignmentScore}%
- Client Session Context:
  - Session Type: ${input.clientAnswers.sessionType || 'General portrait/event'}
  - Preferred Location: ${input.clientAnswers.location || 'Natural/Client preferred'}
  - Desired Mood: ${input.clientAnswers.mood || 'Authentic & emotional'}
  - Special Requests: ${input.clientAnswers.specialRequests || 'None'}
- Top Mismatches to address:
  ${input.mismatches.map((m) => `- ${m.dimension}: ${m.explanation}`).join('\n')}

INSTRUCTIONS:
- Write in warm, professional, encouraging Spanish.
- Do NOT invent requirements not supported by the data.
- Structure recommendations clearly so both photographer and client agree before shooting.

Return ONLY a JSON matching this exact schema:
{
  "visualDirection": [
    "3-4 short bullet points describing the agreed aesthetic direction"
  ],
  "priorityAttributes": [
    "3-4 elements to prioritize during the session"
  ],
  "avoid": [
    "2-3 things both parties agreed to minimize or avoid"
  ],
  "mustHaveShots": [
    "3-5 specific shots or moments that cannot be missed"
  ],
  "editingExpectations": "Clear 2-sentence agreement on color, exposure, and retouch level",
  "referenceImageIds": ${JSON.stringify(input.referenceImageIds || [])},
  "openQuestions": [
    "1-2 friendly questions or items to confirm during prep"
  ],
  "summary": "Concise 2-sentence summary of the shared visual vision"
}`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await Promise.race([
          model.generateContent(prompt),
          createTimeout(TIMEOUT_MS),
        ]);

        const rawText = result.response.text();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid JSON in Gemini brief output');

        const parsed = JSON.parse(jsonMatch[0]);
        // Ensure referenceImageIds is array of strings
        if (!parsed.referenceImageIds || !Array.isArray(parsed.referenceImageIds)) {
          parsed.referenceImageIds = input.referenceImageIds || [];
        }

        const validatedBrief = aiBriefResponseSchema.parse(parsed);

        return {
          content: validatedBrief as BriefContent,
        };
      } catch (err) {
        console.warn(`[GeminiVisionProvider] generateBrief attempt ${attempt} failed:`, err);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
        }
      }
    }

    // Controlled fallback brief
    return {
      content: {
        visualDirection: [
          'Enfoque en momentos auténticos con iluminación cuidada',
          'Tonalidad visual balanceada y fiel a la escena',
          'Composiciones centradas en la emoción de los protagonistas',
        ],
        priorityAttributes: [
          'Luz natural y ambiente orgánico',
          'Espontaneidad en expresiones',
          'Planos variados para contar una historia completa',
        ],
        avoid: [
          'Poses excesivamente rígidas o forzadas',
          'Edición o retoque desmedido que altere la naturalidad',
        ],
        mustHaveShots: [
          'Retratos individuales principales',
          'Momentos espontáneos de interacción',
          'Detalles y planos abiertos del entorno',
        ],
        editingExpectations:
          'Edición consistente con el portafolio del fotógrafo, respetando el balance de color acordado y retoque sutil y respetuoso.',
        referenceImageIds: input.referenceImageIds || [],
        openQuestions: [
          '¿Existe alguna hora del día o ubicación preferida para aprovechar la mejor luz?',
        ],
        summary:
          'Sesión orientada a capturar la esencia natural y emotiva de los protagonistas, alineando las preferencias visuales del cliente con la excelencia técnica del fotógrafo.',
      },
    };
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms)
  );
}

function getNeutralVector(): ImageFeatureVector {
  return {
    warmth: 0.5,
    brightness: 0.5,
    contrast: 0.5,
    saturation: 0.5,
    naturalLight: 0.6,
    candidness: 0.6,
    posedness: 0.4,
    editorialness: 0.4,
    documentaryness: 0.5,
    intimacy: 0.5,
    wideComposition: 0.5,
    retouchLevel: 0.3,
    emotionalIntensity: 0.5,
    minimalism: 0.5,
  };
}

function getLowConfidence(): Record<string, number> {
  const conf: Record<string, number> = {};
  const keys = [
    'warmth','brightness','contrast','saturation','naturalLight',
    'candidness','posedness','editorialness','documentaryness',
    'intimacy','wideComposition','retouchLevel','emotionalIntensity','minimalism'
  ];
  for (const k of keys) conf[k] = 0.5;
  return conf;
}
