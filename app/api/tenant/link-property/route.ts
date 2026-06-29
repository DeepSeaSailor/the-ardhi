import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    const { invite_code } = await req.json()
    const supabase = getSupabaseAdmin()

    // Support base code ("7A87UZ") and unit-specific code ("7A87UZ-U1")
    const raw = invite_code.toUpperCase().trim()
    const unitMatch = raw.match(/^(.+)-U(\d+)$/)
    const baseCode = unitMatch ? unitMatch[1] : raw
    const unitNumber = unitMatch ? parseInt(unitMatch[2]) : null

    // Find property
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
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'You are already linked to this property.' },
        { status: 400 }
      )
    }

    // Find a unit to assign
    let unit: any = null

    if (unitNumber) {
      // Try to find the specific unit number
      const { data: u } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount')
        .eq('property_id', property.id)
        .eq('unit_number', String(unitNumber))
        .maybeSingle()
      unit = u
    }

    if (!unit) {
      // Any vacant unit
      const { data: u } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount')
        .eq('property_id', property.id)
        .eq('is_occupied', false)
        .limit(1)
        .maybeSingle()
      unit = u
    }

    if (!unit) {
      // No units rows at all — auto-create one for this unit number
      const num = unitNumber || 1
      const { data: newUnit, error: uErr } = await supabase
        .from('units')
        .insert({
          property_id: property.id,
          unit_number: String(num),
          rent_amount: 0,
          is_occupied: false,
        })
        .select()
        .single()

      if (uErr) {
        return NextResponse.json({ error: 'Could not assign a unit: ' + uErr.message }, { status: 400 })
      }
      unit = newUnit
    }

    // Create tenancy — only columns that exist in schema
    const { data: tenancy, error } = await supabase
      .from('tenancies')
      .insert({
        tenant_id,
        unit_id: unit.id,
        property_id: property.id,
        rent_amount: unit.rent_amount || 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Mark unit occupied
    await supabase.from('units').update({ is_occupied: true }).eq('id', unit.id)

    // Increment occupied count on property
    try {
      await supabase.rpc('increment_occupied', { prop_id: property.id })
    } catch (_) {}

    return NextResponse.json({ data: tenancy, property_name: property.name })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
