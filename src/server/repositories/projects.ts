/**
 * repositories/projects.ts
 * Database access layer for projects and project reference images.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project, ProjectStatus } from '@/types/database';

export async function getProjectsByOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(id, name, email, phone)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Project[];
}

export async function getProjectById(
  supabase: SupabaseClient,
  projectId: string,
  ownerId?: string
): Promise<Project | null> {
  let query = supabase
    .from('projects')
    .select('*, clients(id, name, email, phone), project_reference_images(image_id, sort_order)')
    .eq('id', projectId);

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  const { data, error } = await query.single();
  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as unknown as Project;
}

export async function createProject(
  supabase: SupabaseClient,
  ownerId: string,
  projectData: {
    name: string;
    type: string;
    client_id?: string;
    event_date?: string;
  }
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      owner_id: ownerId,
      name: projectData.name,
      type: projectData.type,
      client_id: projectData.client_id || null,
      event_date: projectData.event_date || null,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Project;
}

export async function updateProjectStatus(
  supabase: SupabaseClient,
  projectId: string,
  ownerId: string,
  status: ProjectStatus,
  alignmentScore?: number
): Promise<Project> {
  const updatePayload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (alignmentScore !== undefined) {
    updatePayload['alignment_score'] = alignmentScore;
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updatePayload)
    .eq('id', projectId)
    .eq('owner_id', ownerId)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Project;
}

export async function setProjectReferences(
  supabase: SupabaseClient,
  projectId: string,
  imageIds: string[]
): Promise<void> {
  // Clear existing
  await supabase.from('project_reference_images').delete().eq('project_id', projectId);

  if (imageIds.length === 0) return;

  const rows = imageIds.map((image_id, index) => ({
    project_id: projectId,
    image_id,
    sort_order: index,
  }));

  const { error } = await supabase.from('project_reference_images').insert(rows);
  if (error) throw error;
}

export async function getProjectReferenceImages(
  supabase: SupabaseClient,
  projectId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('project_reference_images')
    .select('image_id')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map((row) => row.image_id);
}
