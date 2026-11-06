/* ==============================================================================
   Anviti — Supabase Client Configuration
   Provides safe client initialization and configuration detection.
   ============================================================================== */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Checks whether Supabase has been properly configured with valid credentials.
 * Returns false if credentials are missing or default placeholders.
 */
export function isSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-supabase-anon-key')) {
    return false;
  }
  try {
    const parsed = new URL(supabaseUrl);
    return Boolean(parsed.protocol && parsed.host);
  } catch {
    return false;
  }
}

/**
 * Supabase client instance.
 * Initialized only when valid configuration is present to avoid runtime errors.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
