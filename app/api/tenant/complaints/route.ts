import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('user_id')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('complaints').select('*').eq('tenant_id', user_id).order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user_id = req.headers.get('x-user-id') || body.tenant_id
    const supabase = getSupabaseAdmin()
    const { data: tenancy } = await supabase.from('tenancies').select('unit_id').eq('tenant_id', user_id).eq('is_active', true).single()
    const { data, error } = await supabase.from('complaints').insert({
      tenant_id: user_id, property_id: body.property_id, unit_id: body.unit_id || tenancy?.unit_id,
      description: body.description, status: 'pending',
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
