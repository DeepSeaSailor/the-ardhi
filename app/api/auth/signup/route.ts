import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, full_name, phone, national_id, invite_code } = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password and role are required.' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Tenant invite code check (only if code provided)
    if (role === 'tenant' && invite_code) {
      const { data: property } = await supabase
        .from('properties')
        .select('id')
        .eq('invite_code', invite_code.toUpperCase())
        .single()
      if (!property) {
        return NextResponse.json({ error: 'Invalid invite code. Please check with your landlord.' }, { status: 400 })
      }
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 400 })
    }

    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: full_name || email, role, phone },
      email_confirm: true,
    })

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to create account. Please try again.' }, { status: 400 })
    }

    // Update profile with full details
    if (data?.user?.id) {
      await supabase
        .from('profiles')
        .update({ full_name: full_name || email, phone, national_id, role })
        .eq('id', data.user.id)
    }

    return NextResponse.json({ user: data.user, message: 'Account created successfully.' })
  } catch (e: any) {
    console.error('Signup error:', e)
    return NextResponse.json({ error: e?.message || 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
