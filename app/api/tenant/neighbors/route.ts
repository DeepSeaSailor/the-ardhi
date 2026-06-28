import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('user_id')
    const supabase = getSupabaseAdmin()
    const { data: tenancy } = await supabase.from('tenancies').select('property_id').eq('tenant_id', user_id).eq('is_active', true).single()
    if (!tenancy) return NextResponse.json({ data: [] })
    const { data, error } = await supabase
      .from('tenancies')
      .select(`tenant:profiles!tenancies_tenant_id_fkey(id,full_name), unit:units(unit_number)`)
      .eq('property_id', tenancy.property_id)
      .eq('is_active', true)
      .neq('tenant_id', user_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = data?.map((t: any) => ({ id: t.tenant?.id, full_name: t.tenant?.full_name, unit_number: t.unit?.unit_number }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
