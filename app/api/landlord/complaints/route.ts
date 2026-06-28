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
      .from('complaints')
      .select(`*, tenant:profiles!complaints_tenant_id_fkey(full_name), unit:units(unit_number)`)
      .in('property_id', propIds)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = data?.map((c: any) => ({ ...c, tenant_name: c.tenant?.full_name, unit_number: c.unit?.unit_number }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
