import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    const { invite_code } = await req.json()
    const supabase = getSupabaseAdmin()

    // Accept "7A87UZ" or "7A87UZ-U1"
    const raw = (invite_code || '').toUpperCase().trim()
    const unitMatch = raw.match(/^(.+)-U(\d+)$/)
    const baseCode = unitMatch ? unitMatch[1] : raw
    const unitNumber = unitMatch ? String(unitMatch[2]) : '1'

    // Find property
    const { data: property, error: propErr } = await supabase
      .from('properties')
      .select('id, name, total_units')
      .eq('invite_code', baseCode)
      .maybeSingle()

    if (propErr) return NextResponse.json({ error: propErr.message }, { status: 400 })
    if (!property) return NextResponse.json({ error: 'Invalid invite code. Please check with your landlord.' }, { status: 400 })

    // Check already linked
    const { data: existing } = await supabase
      .from('tenancies')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('property_id', property.id)
      .maybeSingle()

    if (existing) return NextResponse.json({ error: 'You are already linked to this property.' }, { status: 400 })

    // Find or create a unit — unit_id is NOT NULL in schema
    let unit_id: string
    let rent_amount = 0

    // Try specific unit number first
    const { data: specificUnit } = await supabase
      .from('units')
      .select('id, rent_amount')
      .eq('property_id', property.id)
      .eq('unit_number', unitNumber)
      .maybeSingle()

    if (specificUnit) {
      unit_id = specificUnit.id
      rent_amount = specificUnit.rent_amount || 0
    } else {
      // Try any vacant unit
      const { data: vacantUnit } = await supabase
        .from('units')
        .select('id, rent_amount')
        .eq('property_id', property.id)
        .eq('is_occupied', false)
        .limit(1)
        .maybeSingle()

      if (vacantUnit) {
        unit_id = vacantUnit.id
        rent_amount = vacantUnit.rent_amount || 0
      } else {
        // Create the unit — required since unit_id is NOT NULL
        const { data: newUnit, error: uErr } = await supabase
          .from('units')
          .insert({
            property_id: property.id,
            unit_number: unitNumber,
            rent_amount: 0,
            is_occupied: false,
          })
          .select('id')
          .single()

        if (uErr || !newUnit) {
          return NextResponse.json({ error: 'Could not assign unit: ' + (uErr?.message || 'unknown') }, { status: 400 })
        }
        unit_id = newUnit.id
      }
    }

    // Insert tenancy — exact schema: tenant_id, unit_id, property_id, start_date, rent_amount, is_active
    const today = new Date().toISOString().slice(0, 10)
    const { data: tenancy, error: tErr } = await supabase
      .from('tenancies')
      .insert({
        tenant_id,
        unit_id,
        property_id: property.id,
        start_date: today,
        rent_amount,
        is_active: true,
      })
      .select()
      .single()

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 400 })

    // Mark unit occupied
    await supabase.from('units').update({ is_occupied: true }).eq('id', unit_id)

    // Increment occupied_units on property
    await supabase
      .from('properties')
      .update({ occupied_units: (property as any).occupied_units + 1 })
      .eq('id', property.id)

    return NextResponse.json({ data: tenancy, property_name: property.name })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
