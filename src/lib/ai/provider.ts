/**
 * provider.ts
 * Factory returning the configured VisionProvider instance.
 */

import type { VisionProvider } from './types';
import { GeminiVisionProvider } from './gemini';
import { OpenAIVisionProvider } from './openai';

let _provider: VisionProvider | null = null;

export function getAIProvider(): VisionProvider {
  if (_provider) return _provider;

  const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  if (providerName === 'openai') {
    _provider = new OpenAIVisionProvider();
  } else {
    _provider = new GeminiVisionProvider();
  }

  return _provider;
}
