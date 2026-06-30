import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('user_id')
    if (!user_id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user_id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id')
    if (!user_id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
    const body = await req.json()
    const supabase = getSupabaseAdmin()

    const updates: any = {}
    if (body.full_name !== undefined) updates.full_name = body.full_name
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url

    const { data, error } = await supabase.from('profiles')
      .update(updates)
      .eq('id', user_id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
