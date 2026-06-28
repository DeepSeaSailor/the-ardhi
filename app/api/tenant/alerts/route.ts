import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('user_id')
    const supabase = getSupabaseAdmin()
    const { data: tenancy } = await supabase.from('tenancies').select('property_id').eq('tenant_id', user_id).eq('is_active', true).single()
    if (!tenancy) return NextResponse.json({ data: [] })
    const { data, error } = await supabase
      .from('alerts')
      .select(`*, sender:profiles!alerts_sender_id_fkey(full_name)`)
      .eq('property_id', tenancy.property_id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = data?.map((a: any) => ({ ...a, sender_name: a.sender?.full_name }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user_id = req.headers.get('x-user-id') || body.sender_id
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('alerts').insert({
      sender_id: user_id, property_id: body.property_id, type: body.type, message: body.message,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
