import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('tenancies')
      .select(`*, tenant:profiles!tenancies_tenant_id_fkey(*), unit:units(unit_number,rent_amount), property:properties(name)`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = data?.map((t: any) => ({ ...t.tenant, tenancy_id: t.id, property_id: t.property_id, unit_number: t.unit?.unit_number, rent_amount: t.unit?.rent_amount, property_name: t.property?.name }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
