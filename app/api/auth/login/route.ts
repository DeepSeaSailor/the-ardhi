import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
    return NextResponse.json({ user: data.user, profile, session: data.session })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
