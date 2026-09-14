import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://pwpobnxmodafvbdiybul.supabase.co"
const supabaseAnonKey = "sb_publishable_ozrotJNcT-xWGEEb9YAGAA_5Z3tXFgD"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
