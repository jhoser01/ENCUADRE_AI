/**
 * repositories/clients.ts
 * Database access layer for clients.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Client } from '@/types/database';

export async function getClientsByOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*, projects(id, name, status, alignment_score)')
    .eq('owner_id', ownerId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as unknown as Client[];
}

export async function getClientById(
  supabase: SupabaseClient,
  clientId: string,
  ownerId: string
): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*, projects(id, name, status, alignment_score, created_at)')
    .eq('id', clientId)
    .eq('owner_id', ownerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as unknown as Client;
}

export async function createClient(
  supabase: SupabaseClient,
  ownerId: string,
  clientData: { name: string; email?: string; phone?: string }
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      owner_id: ownerId,
      name: clientData.name,
      email: clientData.email || null,
      phone: clientData.phone || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Client;
}
