import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const landlord_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('landlord_id')
    const supabase = getSupabaseAdmin()
    const { data: props } = await supabase.from('properties').select('id').eq('landlord_id', landlord_id)
    const propIds = props?.map((p: any) => p.id) || []
    if (propIds.length === 0) return NextResponse.json({ data: [] })
    const { data, error } = await supabase
      .from('payments')
      .select(`*, tenant:profiles!payments_tenant_id_fkey(full_name), property:properties(name)`)
      .in('property_id', propIds)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = data?.map((p: any) => ({ ...p, tenant_name: p.tenant?.full_name, property_name: p.property?.name }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
