import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    const { invite_code } = await req.json()
    const supabase = getSupabaseAdmin()

    // Support both base code ("7A87UZ") and unit-specific code ("7A87UZ-U1")
    const raw = invite_code.toUpperCase().trim()
    const unitMatch = raw.match(/^(.+)-U(\d+)$/)
    const baseCode = unitMatch ? unitMatch[1] : raw
    const unitNumber = unitMatch ? parseInt(unitMatch[2]) : null

    // Find property by base invite code
    const { data: property } = await supabase
      .from('properties')
      .select('id, landlord_id, name, total_units')
      .eq('invite_code', baseCode)
      .single()

    if (!property) {
      return NextResponse.json(
        { error: 'Invalid invite code. Please check with your landlord.' },
        { status: 400 }
      )
    }

    // Check not already linked
    const { data: existing } = await supabase
      .from('tenancies')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('property_id', property.id)
      .eq('is_active', true)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'You are already linked to this property.' },
        { status: 400 }
      )
    }

    // Try to find a unit from the units table
    let unit: any = null

    if (unitNumber) {
      // Try to find the specific unit by number
      const { data: specificUnit } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount')
        .eq('property_id', property.id)
        .or(`unit_number.eq.${unitNumber},unit_number.eq.Unit ${unitNumber}`)
        .limit(1)
        .single()
      unit = specificUnit
    }

    if (!unit) {
      // Try any vacant unit
      const { data: vacantUnit } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount')
        .eq('property_id', property.id)
        .eq('is_occupied', false)
        .limit(1)
        .single()
      unit = vacantUnit
    }

    if (unit) {
      // Units table exists and has a unit — use it
      const { data: tenancy, error } = await supabase.from('tenancies').insert({
        tenant_id,
        unit_id: unit.id,
        property_id: property.id,
        landlord_id: property.landlord_id,
        rent_amount: unit.rent_amount,
        is_active: true,
        start_date: new Date().toISOString().slice(0, 10),
      }).select().single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      // Mark unit occupied
      await supabase.from('units').update({ is_occupied: true }).eq('id', unit.id)

      return NextResponse.json({ data: tenancy, property_name: property.name })
    } else {
      // No units table rows — create tenancy directly with unit number from code
      const assignedUnit = unitNumber || 1
      const { data: tenancy, error } = await supabase.from('tenancies').insert({
        tenant_id,
        property_id: property.id,
        landlord_id: property.landlord_id,
        unit_number: String(assignedUnit),
        rent_amount: 0,
        is_active: true,
        start_date: new Date().toISOString().slice(0, 10),
      }).select().single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      return NextResponse.json({ data: tenancy, property_name: property.name })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
