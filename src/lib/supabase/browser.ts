/**
 * lib/supabase/browser.ts
 * Browser Supabase client using @supabase/ssr.
 * Safe to import in Client Components.
 */
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createBrowserClient() {
  return createSSRBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
