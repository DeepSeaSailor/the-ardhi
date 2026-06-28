import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message?.includes('Invalid login')) {
        return NextResponse.json({ error: 'Incorrect email or password. Please try again.' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message || 'Login failed. Please try again.' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({ user: data.user, profile, session: data.session })
  } catch (e: any) {
    console.error('Login error:', e)
    return NextResponse.json({ error: e?.message || 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
