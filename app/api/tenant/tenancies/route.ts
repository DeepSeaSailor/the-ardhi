import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('tenancies')
      .select(`
        *,
        unit:units(unit_number, rent_amount),
        property:properties(name, location, type, amenities)
      `)
      .eq('tenant_id', tenant_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = (data || []).map((t: any) => ({
      ...t,
      unit_number: t.unit?.unit_number,
      rent_amount: t.rent_amount || t.unit?.rent_amount,
      property_name: t.property?.name,
      property_location: t.property?.location,
      property_type: t.property?.type,
      amenities: t.property?.amenities || [],
    }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
