/**
 * schemas/index.ts
 * Zod schemas for all API inputs, form data, and AI output validation.
 * All AI responses MUST be validated through these schemas before use.
 */

import { z } from 'zod';

export const imageFeatureVectorSchema = z.object({
  warmth:             z.number().min(0).max(1),
  brightness:         z.number().min(0).max(1),
  contrast:           z.number().min(0).max(1),
  saturation:         z.number().min(0).max(1),
  naturalLight:       z.number().min(0).max(1),
  candidness:         z.number().min(0).max(1),
  posedness:          z.number().min(0).max(1),
  editorialness:      z.number().min(0).max(1),
  documentaryness:    z.number().min(0).max(1),
  intimacy:           z.number().min(0).max(1),
  wideComposition:    z.number().min(0).max(1),
  retouchLevel:       z.number().min(0).max(1),
  emotionalIntensity: z.number().min(0).max(1),
  minimalism:         z.number().min(0).max(1),
});
export type ImageFeatureVectorInput = z.infer<typeof imageFeatureVectorSchema>;

export const createProjectSchema = z.object({
  name:       z.string().min(1).max(120),
  type:       z.string().min(1).max(60),
  client_id:  z.string().uuid().optional(),
  event_date: z.string().datetime({ offset: true }).optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['draft', 'active', 'waiting', 'aligned', 'archived']).optional(),
});
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const createClientSchema = z.object({
  name:  z.string().min(1).max(120),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
});
export type CreateClientInput = z.infer<typeof createClientSchema>;
export const updateClientSchema = createClientSchema.partial();
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_FILE_BYTES = 25 * 1024 * 1024;

export const uploadImageSchema = z.object({
  name:               z.string().min(1),
  type:               z.enum(ALLOWED_IMAGE_TYPES),
  size:               z.number().int().positive().max(MAX_FILE_BYTES, {
    message: 'File must be smaller than 25 MB.',
  }),
  category:           z.string().max(60).optional(),
  is_style_reference: z.boolean().default(false),
});
export type UploadImageInput = z.infer<typeof uploadImageSchema>;

export const clientSessionTokenSchema = z.string().min(32).regex(/^[0-9a-f]+$/i, {
  message: 'Token must be a hex string.',
});

export const clientAnswersSchema = z.object({
  sessionType:     z.string().max(120).optional(),
  location:        z.string().max(120).optional(),
  mood:            z.string().max(500).optional(),
  specialRequests: z.string().max(1000).optional(),
});
export type ClientAnswersInput = z.infer<typeof clientAnswersSchema>;

export const pairwiseChoiceSchema = z.object({
  left_image_id:     z.string().uuid(),
  right_image_id:    z.string().uuid(),
  selected_image_id: z.string().uuid(),
  response_ms:       z.number().int().nonnegative().optional(),
});
export type PairwiseChoiceInput = z.infer<typeof pairwiseChoiceSchema>;

export const submitPreferencesSchema = z.object({
  token:   clientSessionTokenSchema,
  choices: z.array(pairwiseChoiceSchema).min(1).max(50),
  answers: clientAnswersSchema,
});
export type SubmitPreferencesInput = z.infer<typeof submitPreferencesSchema>;

export const briefContentSchema = z.object({
  visualDirection:     z.array(z.string()).min(1),
  priorityAttributes:  z.array(z.string()).min(1),
  avoid:               z.array(z.string()),
  mustHaveShots:       z.array(z.string()),
  editingExpectations: z.string().min(1),
  referenceImageIds:   z.array(z.string().uuid()),
  openQuestions:       z.array(z.string()),
  summary:             z.string().min(1),
});
export type BriefContentInput = z.infer<typeof briefContentSchema>;

const DIMENSION_KEYS = [
  'warmth','brightness','contrast','saturation','naturalLight',
  'candidness','posedness','editorialness','documentaryness','intimacy',
  'wideComposition','retouchLevel','emotionalIntensity','minimalism',
] as const;

const alignmentDimensionSchema = z.object({
  key:               z.enum(DIMENSION_KEYS),
  photographerValue: z.number().min(0).max(1),
  clientValue:       z.number().min(0).max(1),
  difference:        z.number().min(-1).max(1),
  weight:            z.number().positive(),
});

const alignmentMismatchSchema = z.object({
  dimension:         z.enum(DIMENSION_KEYS),
  photographerValue: z.number().min(0).max(1),
  clientValue:       z.number().min(0).max(1),
  difference:        z.number().min(-1).max(1),
  explanation:       z.string(),
});

export const alignmentResultSchema = z.object({
  score:             z.number().min(0).max(100),
  dimensions:        z.array(alignmentDimensionSchema),
  mismatches:        z.array(alignmentMismatchSchema).max(3),
  explanation:       z.string().nullable(),
  algorithm_version: z.string(),
});
export type AlignmentResultInput = z.infer<typeof alignmentResultSchema>;

export const aiAnalysisResponseSchema = imageFeatureVectorSchema;
export type AIAnalysisResponse = z.infer<typeof aiAnalysisResponseSchema>;
export const aiBriefResponseSchema = briefContentSchema;
export type AIBriefResponse = z.infer<typeof aiBriefResponseSchema>;

export const generateClientLinkSchema = z.object({
  projectId: z.string().uuid(),
  expiresIn: z.number().int().positive().default(7 * 24 * 60 * 60),
});
export type GenerateClientLinkInput = z.infer<typeof generateClientLinkSchema>;

export const approveBriefSchema = z.object({
  briefId:   z.string().uuid(),
  actorType: z.enum(['photographer', 'client']),
  comment:   z.string().max(1000).optional(),
});
export type ApproveBriefInput = z.infer<typeof approveBriefSchema>;
