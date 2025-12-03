import { createClient } from '@supabase/supabase-js';

// Use Vite import.meta.env; fallback to empty strings to satisfy types
const env: any = (import.meta as any).env || {};
const supabaseUrl: string = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
