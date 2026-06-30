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
    if (!['admin', 'landlord', 'tenant'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const adminClient = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const anonClient = createClient(url, anonKey)

    // Tenant invite code check — validate before creating any account
    if (role === 'tenant' && invite_code) {
      const raw = invite_code.toUpperCase().trim()
      const baseCode = raw.includes('-U') ? raw.split('-U')[0] : raw
      const { data: property } = await adminClient
        .from('properties').select('id')
        .eq('invite_code', baseCode).maybeSingle()
      if (!property) {
        return NextResponse.json({ error: 'Invalid invite code. Please check with your landlord.' }, { status: 400 })
      }
    }

    // Check email isn't already registered (avoids confusing duplicate-key errors downstream)
    const { data: existingList } = await adminClient.auth.admin.listUsers()
    const exists = existingList?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
    if (exists) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 400 })
    }

    // Create the auth user WITHOUT relying on any DB trigger to populate profiles.
    // We do that explicitly right after, with full error visibility.
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || email, role, phone },
    })

    if (authError) {
      console.error('SIGNUP: createUser failed —', authError.message)
      return NextResponse.json({ error: 'Could not create account. ' + authError.message }, { status: 400 })
    }
    if (!authData?.user) {
      return NextResponse.json({ error: 'Account creation failed. Please try again.' }, { status: 400 })
    }

    const userId = authData.user.id

    // Explicitly create the profile row — this is now the ONLY place it happens
    const { error: profileError } = await adminClient.from('profiles').upsert({
      id: userId,
      email,
      full_name: full_name || email,
      phone: phone || null,
      role,
      is_active: true,
    })

    if (profileError) {
      // Roll back the auth user so we don't leave an orphaned account with no profile
      console.error('SIGNUP: profile insert failed —', profileError.message)
      await adminClient.auth.admin.deleteUser(userId).catch(() => {})
      return NextResponse.json({ error: 'Could not finish setting up your account. ' + profileError.message }, { status: 400 })
    }

    // Sign in immediately so the client gets a session back
    const { data: session, error: signInError } = await anonClient.auth.signInWithPassword({ email, password })
    if (signInError) {
      console.error('SIGNUP: auto sign-in failed —', signInError.message)
      return NextResponse.json({ user: authData.user, message: 'Account created. Please sign in.' })
    }

    return NextResponse.json({ user: session.user, session: session.session, message: 'Account created successfully.' })
  } catch (e: any) {
    console.error('SIGNUP: unexpected error —', e?.message)
    return NextResponse.json({ error: e?.message || 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
