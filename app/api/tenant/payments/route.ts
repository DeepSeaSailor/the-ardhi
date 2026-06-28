import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('user_id')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('payments').select('*').eq('tenant_id', user_id).order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user_id = req.headers.get('x-user-id') || body.tenant_id
    const supabase = getSupabaseAdmin()
    const ref = 'ADH' + Date.now().toString().slice(-8)
    const { data, error } = await supabase.from('payments').insert({
      tenancy_id: body.tenancy_id, tenant_id: user_id, property_id: body.property_id,
      amount: body.amount, payment_method: body.payment_method, phone_or_account: body.phone_or_account,
      status: 'pending', month_year: body.month_year, reference: ref,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
