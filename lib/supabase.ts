import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qoxudkdheiacihhisnpr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_DHTtDgl0n1LyNkGnfASI0A_X63F3op5';

export const supabase = createClient(supabaseUrl, supabaseKey);
