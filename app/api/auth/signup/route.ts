import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, full_name, phone, invite_code } = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password and role are required.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const adminClient = createClient(url, serviceKey)
    const anonClient = createClient(url, anonKey)

    // Tenant invite code check
    if (role === 'tenant' && invite_code) {
      const { data: property } = await adminClient
        .from('properties').select('id')
        .eq('invite_code', invite_code.toUpperCase()).single()
      if (!property) {
        return NextResponse.json({ error: 'Invalid invite code. Please check with your landlord.' }, { status: 400 })
      }
    }

    // Check if email already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers()
    const exists = existingUsers?.users?.find((u: any) => u.email === email)
    if (exists) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 400 })
    }

    // Create user via admin API (bypasses email confirmation)
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm
      user_metadata: { full_name: full_name || email, role, phone },
    })

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to create account. Please try again.' }, { status: 400 })
    }

    if (!data?.user) {
      return NextResponse.json({ error: 'Account creation failed. Please try again.' }, { status: 400 })
    }

    // Update profile
    await adminClient.from('profiles')
      .update({ full_name: full_name || email, phone, role })
      .eq('id', data.user.id)

    // Sign in immediately and return session
    const { data: session, error: signInError } = await anonClient.auth.signInWithPassword({ email, password })
    if (signInError) {
      return NextResponse.json({ user: data.user, message: 'Account created. Please sign in.' })
    }

    return NextResponse.json({ user: session.user, session: session.session, message: 'Account created successfully.' })
  } catch (e: any) {
    console.error('Signup error:', e)
    return NextResponse.json({ error: e?.message || 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
