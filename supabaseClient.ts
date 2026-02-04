import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

let supabase: SupabaseClient;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
} catch {
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
