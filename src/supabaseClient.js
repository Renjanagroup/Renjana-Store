import { createClient } from '@supabase/supabase-js'

const supabaseUrl = https://pwpobnxmodafvbdiybul.supabase.co/rest/v1/
const supabaseAnonKey = sb_publishable_ozrotJNcT-xWGEEb9YAGAA_5Z3tXFgD

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diatur. Salin .env.example menjadi .env dan isi datanya.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
