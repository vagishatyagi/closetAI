import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_URL is missing in environment variables.');
}

// 1. Standard Client - respects RLS, safe for both client and server components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Admin Client - bypasses RLS, strictly server-only! Do NOT use on the client-side.
export const getSupabaseAdmin = () => {
  if (!supabaseServiceKey) {
    throw new Error('Critical: SUPABASE_SERVICE_ROLE_KEY is missing. Admin bypass failed.');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
