import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, full_name, phone, invite_code } = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password and role are required.' }, { status: 400 })
    }

    // Use anon key for signup - this works without service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Tenant invite code check
    if (role === 'tenant' && invite_code) {
      const { data: property } = await supabase
        .from('properties').select('id')
        .eq('invite_code', invite_code.toUpperCase()).single()
      if (!property) {
        return NextResponse.json({ error: 'Invalid invite code. Please check with your landlord.' }, { status: 400 })
      }
    }

    // Sign up with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: full_name || email, role, phone }
      }
    })

    if (error) {
      if (error.message?.includes('already registered')) {
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message || 'Failed to create account.' }, { status: 400 })
    }

    if (!data?.user) {
      return NextResponse.json({ error: 'Account creation failed. Please try again.' }, { status: 400 })
    }

    // Update profile role — use service role if available, else skip
    try {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await adminClient.from('profiles')
        .update({ full_name: full_name || email, phone, role })
        .eq('id', data.user.id)
    } catch {}

    return NextResponse.json({ user: data.user, message: 'Account created successfully.' })
  } catch (e: any) {
    console.error('Signup error:', e)
    return NextResponse.json({ error: e?.message || 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
