/**
 * lib/ai/types.ts
 * Interfaces for the AI provider abstraction layer.
 */
import type { ImageFeatureVector, AlignmentMismatch, ClientAnswers, BriefContent } from '@/types/database';

export interface AnalyzeImageInput {
  imageUrl: string;
  imageId:  string;
}

export interface ImageFeatureResult {
  features:          ImageFeatureVector;
  confidence:        Record<string, number>;
  algorithm_version: string;
}

export interface BriefInput {
  styleVector:       ImageFeatureVector;
  clientVector:      ImageFeatureVector;
  alignmentScore:    number;
  mismatches:        AlignmentMismatch[];
  clientAnswers:     ClientAnswers;
  referenceImageIds: string[];
}

export interface BriefResult {
  content: BriefContent;
}

/** Common interface implemented by all AI providers (Gemini, OpenAI, ...). */
export interface VisionProvider {
  analyzeImage(input: AnalyzeImageInput): Promise<ImageFeatureResult>;
  generateBrief(input: BriefInput): Promise<BriefResult>;
}
