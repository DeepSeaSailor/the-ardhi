import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user_id = req.headers.get('x-user-id') || body.user_id
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('profiles').update({
      national_id_front: body.national_id_front?.slice(0, 500),
      national_id_back: body.national_id_back?.slice(0, 500),
      kyc_status: 'pending',
      phone: body.phone,
    }).eq('id', user_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
