import { createClient } from '@supabase/supabase-js';

// It will try to read the env file first, but if it fails, it uses the hardcoded strings safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xbnzwejtelqjboiztsdt.supabase.co';

// REPLACE the string below with your full publishable key from Supabase (starting with sb_publishable...)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_6feHf24OLPQB-gX5uvKE9g_SbUykHoG';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);