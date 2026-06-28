import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('user_id')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user_id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id')
    const body = await req.json()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('profiles')
      .update({ full_name: body.full_name, phone: body.phone })
      .eq('id', user_id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
