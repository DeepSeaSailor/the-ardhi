import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, full_name, phone, national_id, invite_code } = await req.json()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Tenant must have valid invite code
    if (role === 'tenant' && invite_code) {
      const { data: property } = await supabase
        .from('properties')
        .select('id')
        .eq('invite_code', invite_code.toUpperCase())
        .single()
      if (!property) return NextResponse.json({ error: 'Invalid invite code. Please check with your landlord.' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email, password,
      user_metadata: { full_name, role, phone },
      email_confirm: true
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Update profile
    await supabase.from('profiles').update({ full_name, phone, national_id, role }).eq('id', data.user.id)

    // If landlord, no extra action needed
    // If tenant with invite code, we'll link after profile setup (done from dashboard)

    return NextResponse.json({ user: data.user, message: 'Account created. Please sign in.' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
