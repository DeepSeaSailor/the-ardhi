import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    if (!tenant_id) return NextResponse.json({ data: [] })
    const supabase = getSupabaseAdmin()

    // Primary fetch: by tenant_id
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

    if (data && data.length > 0) {
      const flat = data.map((t: any) => ({
        ...t,
        unit_number: t.unit?.unit_number || t.unit_number,
        rent_amount: t.rent_amount || t.unit?.rent_amount || 0,
        property_name: t.property?.name,
        property_location: t.property?.location,
        property_type: t.property?.type,
        amenities: t.property?.amenities || [],
      }))
      return NextResponse.json({ data: flat })
    }

    // Fallback: maybe tenant_id in tenancies is the profile id but auth uid differs
    // Try via profiles table to confirm the user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', tenant_id)
      .single()

    if (!profile) return NextResponse.json({ data: [] })

    // Try fetching tenancies without is_active filter (in case it's null not true)
    const { data: allTenancies } = await supabase
      .from('tenancies')
      .select(`
        *,
        unit:units(unit_number, rent_amount),
        property:properties(name, location, type, amenities)
      `)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })

    if (!allTenancies || allTenancies.length === 0) return NextResponse.json({ data: [] })

    // Fix any null is_active rows
    const toFix = allTenancies.filter((t: any) => t.is_active === null || t.is_active === undefined)
    if (toFix.length > 0) {
      await supabase.from('tenancies').update({ is_active: true }).in('id', toFix.map((t: any) => t.id))
    }

    const flat = allTenancies.map((t: any) => ({
      ...t,
      is_active: true,
      unit_number: t.unit?.unit_number || t.unit_number,
      rent_amount: t.rent_amount || t.unit?.rent_amount || 0,
      property_name: t.property?.name,
      property_location: t.property?.location,
      property_type: t.property?.type,
      amenities: t.property?.amenities || [],
    }))

    return NextResponse.json({ data: flat })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
