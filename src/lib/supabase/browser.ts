/**
 * lib/supabase/browser.ts
 * Browser Supabase client singleton using @supabase/ssr.
 * Safe to import in Client Components.
 */
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient<Database> | null = null;

/**
 * Returns a singleton Supabase client for the browser.
 * Call this inside a Client Component or hook.
 */
export function createBrowserClient(): SupabaseClient<Database> {
  if (client) return client;
  client = createSSRBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}
