/**
 * repositories/sessions.ts
 * Database access layer for anonymous client sessions, pairwise choices, and client answers.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ClientSession,
  PairwiseChoice,
  ClientAnswers,
  PreferenceProfile,
  ImageFeatureVector,
  SessionStatus,
} from '@/types/database';

export async function createClientSession(
  supabase: SupabaseClient,
  projectId: string,
  tokenHash: string,
  expiresAt: string
): Promise<ClientSession> {
  const { data, error } = await supabase
    .from('client_sessions')
    .insert({
      project_id: projectId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ClientSession;
}

export async function getSessionByTokenHash(
  supabase: SupabaseClient,
  tokenHash: string
): Promise<(ClientSession & { projects?: any }) | null> {
  const { data, error } = await supabase
    .from('client_sessions')
    .select('*, projects(*, profiles(display_name, studio_name))')
    .eq('token_hash', tokenHash)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as unknown as ClientSession & { projects?: any };
}

export async function updateSessionStatus(
  supabase: SupabaseClient,
  sessionId: string,
  status: SessionStatus,
  completedAt?: string
): Promise<void> {
  const payload: Record<string, unknown> = { status };
  if (status === 'active' && !completedAt) {
    payload['started_at'] = new Date().toISOString();
  }
  if (completedAt) {
    payload['completed_at'] = completedAt;
  }

  const { error } = await supabase
    .from('client_sessions')
    .update(payload)
    .eq('id', sessionId);

  if (error) throw error;
}

export async function savePairwiseChoices(
  supabase: SupabaseClient,
  sessionId: string,
  choices: Array<{
    left_image_id: string;
    right_image_id: string;
    selected_image_id: string;
    response_ms?: number;
  }>
): Promise<void> {
  const rows = choices.map((c) => ({
    session_id: sessionId,
    left_image_id: c.left_image_id,
    right_image_id: c.right_image_id,
    selected_image_id: c.selected_image_id,
    response_ms: c.response_ms || null,
  }));

  const { error } = await supabase.from('pairwise_choices').insert(rows);
  if (error) throw error;
}

export async function saveClientAnswers(
  supabase: SupabaseClient,
  sessionId: string,
  answers: ClientAnswers
): Promise<void> {
  const { error } = await supabase.from('client_answers').upsert({
    session_id: sessionId,
    answers,
  });

  if (error) throw error;
}

export async function savePreferenceProfile(
  supabase: SupabaseClient,
  profileData: {
    session_id: string;
    vector: ImageFeatureVector;
    confidence: Record<string, number>;
    algorithm_version: string;
  }
): Promise<PreferenceProfile> {
  const { data, error } = await supabase
    .from('preference_profiles')
    .upsert({
      session_id: profileData.session_id,
      vector: profileData.vector,
      confidence: profileData.confidence,
      algorithm_version: profileData.algorithm_version,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as PreferenceProfile;
}

export async function getPreferenceProfile(
  supabase: SupabaseClient,
  sessionId: string
): Promise<PreferenceProfile | null> {
  const { data, error } = await supabase
    .from('preference_profiles')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as unknown as PreferenceProfile;
}
