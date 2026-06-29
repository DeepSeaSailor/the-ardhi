import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    if (!tenant_id) return NextResponse.json({ data: [] })
    const supabase = getSupabaseAdmin()

    // Fetch tenancies — exact schema columns only
    const { data: tenancies, error } = await supabase
      .from('tenancies')
      .select('id, unit_id, property_id, start_date, end_date, rent_amount, is_active, created_at')
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('tenancies error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!tenancies || tenancies.length === 0) return NextResponse.json({ data: [] })

    // Enrich each row separately — no joins
    const results = await Promise.all(tenancies.map(async (t: any) => {
      let unit_number = '1'
      let property_name = 'Property'
      let property_location = ''
      let property_type = ''
      let amenities: string[] = []

      // Get unit
      if (t.unit_id) {
        const { data: unit } = await supabase
          .from('units')
          .select('unit_number, rent_amount')
          .eq('id', t.unit_id)
          .maybeSingle()
        if (unit) {
          unit_number = unit.unit_number || '1'
          if (!t.rent_amount) t.rent_amount = unit.rent_amount
        }
      }

      // Get property
      if (t.property_id) {
        const { data: prop } = await supabase
          .from('properties')
          .select('name, location, type, amenities')
          .eq('id', t.property_id)
          .maybeSingle()
        if (prop) {
          property_name = prop.name
          property_location = prop.location
          property_type = prop.type
          amenities = prop.amenities || []
        }
      }

      return {
        ...t,
        unit_number,
        rent_amount: t.rent_amount || 0,
        property_name,
        property_location,
        property_type,
        amenities,
      }
    }))

    return NextResponse.json({ data: results })
  } catch (e: any) {
    console.error('tenancies catch:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
