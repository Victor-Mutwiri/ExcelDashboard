import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// The Supabase URL and Key must be valid for this to work.
// If they are not, Supabase will throw an error on initialization.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);