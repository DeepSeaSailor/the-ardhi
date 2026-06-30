import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, full_name, phone, invite_code } = await req.json()

    if (!email || !password || !role) {
      console.error('SIGNUP_DEBUG: missing fields', { email: !!email, password: !!password, role })
      return NextResponse.json({ error: 'Email, password and role are required.' }, { status: 400 })
    }

    if (password.length < 6) {
      console.error('SIGNUP_DEBUG: password too short')
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!url || !serviceKey || !anonKey) {
      console.error('SIGNUP_DEBUG: missing env vars', { hasUrl: !!url, hasServiceKey: !!serviceKey, hasAnonKey: !!anonKey })
      return NextResponse.json({ error: 'Server configuration error. Please contact support.' }, { status: 500 })
    }

    const adminClient = createClient(url, serviceKey)
    const anonClient = createClient(url, anonKey)

    // Tenant invite code check
    if (role === 'tenant' && invite_code) {
      const raw = invite_code.toUpperCase().trim()
      const baseCode = raw.includes('-U') ? raw.split('-U')[0] : raw
      const { data: property, error: propErr } = await adminClient
        .from('properties').select('id')
        .eq('invite_code', baseCode).maybeSingle()
      if (propErr) {
        console.error('SIGNUP_DEBUG: property lookup error', propErr.message)
      }
      if (!property) {
        console.error('SIGNUP_DEBUG: invalid invite code', { raw, baseCode })
        return NextResponse.json({ error: 'Invalid invite code. Please check with your landlord.' }, { status: 400 })
      }
    }

    // Check if email already exists
    const { data: existingUsers, error: listErr } = await adminClient.auth.admin.listUsers()
    if (listErr) {
      console.error('SIGNUP_DEBUG: listUsers error', listErr.message)
    }
    const exists = existingUsers?.users?.find((u: any) => u.email === email)
    if (exists) {
      console.error('SIGNUP_DEBUG: email already exists', email)
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 400 })
    }

    // Create user via admin API (bypasses email confirmation)
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || email, role, phone },
    })

    if (error) {
      console.error('SIGNUP_DEBUG: createUser error', error.message, JSON.stringify(error))
      return NextResponse.json({ error: error.message || 'Failed to create account. Please try again.' }, { status: 400 })
    }

    if (!data?.user) {
      console.error('SIGNUP_DEBUG: no user returned from createUser')
      return NextResponse.json({ error: 'Account creation failed. Please try again.' }, { status: 400 })
    }

    // Update profile — log if this fails too
    const { error: profileErr } = await adminClient.from('profiles')
      .update({ full_name: full_name || email, phone, role })
      .eq('id', data.user.id)

    if (profileErr) {
      console.error('SIGNUP_DEBUG: profile update error', profileErr.message)
    }

    // Sign in immediately and return session
    const { data: session, error: signInError } = await anonClient.auth.signInWithPassword({ email, password })
    if (signInError) {
      console.error('SIGNUP_DEBUG: signIn after signup error', signInError.message)
      return NextResponse.json({ user: data.user, message: 'Account created. Please sign in.' })
    }

    return NextResponse.json({ user: session.user, session: session.session, message: 'Account created successfully.' })
  } catch (e: any) {
    console.error('SIGNUP_DEBUG: catch block', e?.message, e?.stack)
    return NextResponse.json({ error: e?.message || 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
