/**
 * repositories/briefs.ts
 * Database access layer for Visual Briefs and their dual approvals.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Brief,
  BriefContent,
  BriefApproval,
  ActorType,
  BriefStatus,
} from '@/types/database';

export async function createBrief(
  supabase: SupabaseClient,
  briefData: {
    project_id: string;
    version: number;
    content: BriefContent;
    status?: BriefStatus;
  }
): Promise<Brief> {
  const { data, error } = await supabase
    .from('briefs')
    .insert({
      project_id: briefData.project_id,
      version: briefData.version,
      content: briefData.content,
      status: briefData.status || 'pending_approval',
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Brief;
}

export async function getLatestBrief(
  supabase: SupabaseClient,
  projectId: string
): Promise<Brief | null> {
  const { data, error } = await supabase
    .from('briefs')
    .select('*, brief_approvals(*)')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as unknown as Brief;
}

export async function getBriefById(
  supabase: SupabaseClient,
  briefId: string
): Promise<Brief | null> {
  const { data, error } = await supabase
    .from('briefs')
    .select('*, brief_approvals(*)')
    .eq('id', briefId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as unknown as Brief;
}

export async function recordApproval(
  supabase: SupabaseClient,
  approvalData: {
    brief_id: string;
    actor_type: ActorType;
    comment?: string | null;
  }
): Promise<BriefApproval> {
  const { data, error } = await supabase
    .from('brief_approvals')
    .upsert({
      brief_id: approvalData.brief_id,
      actor_type: approvalData.actor_type,
      approved_at: new Date().toISOString(),
      comment: approvalData.comment || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Check if both approved
  const { data: allApprovals } = await supabase
    .from('brief_approvals')
    .select('actor_type')
    .eq('brief_id', approvalData.brief_id);

  const actors = (allApprovals || []).map((a: any) => a.actor_type);
  if (actors.includes('photographer') && actors.includes('client')) {
    await supabase
      .from('briefs')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', approvalData.brief_id);
  }

  return data as unknown as BriefApproval;
}

export async function getApprovalsForBrief(
  supabase: SupabaseClient,
  briefId: string
): Promise<BriefApproval[]> {
  const { data, error } = await supabase
    .from('brief_approvals')
    .select('*')
    .eq('brief_id', briefId);

  if (error) throw error;
  return (data || []) as unknown as BriefApproval[];
}
