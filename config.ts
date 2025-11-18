/**
 * Supabase Configuration
 * 
 * IMPORTANT: These values should be stored in environment variables for security.
 * In a local development environment, you can create a `.env.local` file:
 * 
 * SUPABASE_URL=https://your-project-ref.supabase.co
 * SUPABASE_ANON_KEY=your-public-anon-key
 * 
 * In a production environment (like Vercel, Netlify, etc.), these should be set
 * in the environment variable settings of your hosting provider.
 */

// Replace these placeholders with your actual Supabase project URL and public anon key.
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project-ref.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-public-anon-key';