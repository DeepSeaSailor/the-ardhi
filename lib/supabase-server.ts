import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton — created once, reused across all requests
let adminClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase environment variables')
    adminClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  return adminClient
}
