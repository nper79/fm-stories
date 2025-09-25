import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if we have real credentials
const isConfigured = supabaseUrl !== 'your_supabase_project_url' && 
                    supabaseAnonKey !== 'your_supabase_anon_key' &&
                    supabaseUrl !== 'https://placeholder.supabase.co' &&
                    supabaseAnonKey !== 'placeholder-key'

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null