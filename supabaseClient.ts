import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// Define the placeholder values to check against.
const SUPABASE_URL_PLACEHOLDER = 'https://smotamzzaisrenukxjge.supabase.co';
const SUPABASE_ANON_KEY_PLACEHOLDER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb3RhbXp6YWlzcmVudWt4amdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTkzODgsImV4cCI6MjA3ODk5NTM4OH0.dOvtVqRJVZZbG5kC0CNf0jlU5Sb6foWkbf2hgFX8Pb4';

let supabase: SupabaseClient | null = null;
let isSupabaseConfigured = false;

// Check if the credentials are the placeholders.
if (
    SUPABASE_URL && SUPABASE_URL !== SUPABASE_URL_PLACEHOLDER &&
    SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== SUPABASE_ANON_KEY_PLACEHOLDER
) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isSupabaseConfigured = true;
} else {
    console.error("Supabase is not configured. Authentication features will be disabled. Please add your Supabase URL and Anon Key to config.ts.");
}

export { supabase, isSupabaseConfigured };
