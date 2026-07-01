import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    const { invite_code } = await req.json()
    const supabase = getSupabaseAdmin()

    // Parse code — accept "7A87UZ" or "7A87UZ-U3"
    const raw = (invite_code || '').toUpperCase().trim()
    const unitMatch = raw.match(/^(.+)-U(\d+)$/)
    const baseCode = unitMatch ? unitMatch[1] : raw
    const unitNumber = unitMatch ? unitMatch[2] : null

    // Find property
    const { data: property, error: propErr } = await supabase
      .from('properties')
      .select('id, name, total_units')
      .eq('invite_code', baseCode)
      .maybeSingle()

    if (propErr) return NextResponse.json({ error: propErr.message }, { status: 400 })
    if (!property) return NextResponse.json({ error: 'Invalid invite code. Please check with your landlord.' }, { status: 400 })

    // Check tenant not already linked to this property
    const { data: existing } = await supabase
      .from('tenancies')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('property_id', property.id)
      .maybeSingle()

    if (existing) return NextResponse.json({ error: 'You are already linked to this property.' }, { status: 400 })

    // Find the specific unit — must match exactly and must not be occupied
    let unit: any = null

    if (unitNumber) {
      // Unit-specific code — find that exact unit number and check it is free
      const { data: units } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount, is_occupied')
        .eq('property_id', property.id)
        .eq('unit_number', unitNumber)
        .order('created_at', { ascending: true })

      // Pick the first unoccupied one with that number
      unit = (units || []).find((u: any) => !u.is_occupied)

      if (!unit && units && units.length > 0) {
        return NextResponse.json({ error: 'Unit ' + unitNumber + ' is already occupied. Ask your landlord for another code.' }, { status: 400 })
      }
    }

    if (!unit) {
      // No specific unit or not found — should not reach here from the new two-step flow
      // but handle gracefully: find any vacant unit
      const { data: vacantUnits } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount, is_occupied')
        .eq('property_id', property.id)
        .eq('is_occupied', false)
        .order('unit_number', { ascending: true })
        .limit(1)

      unit = vacantUnits?.[0] || null
    }

    if (!unit) {
      // No units in table — create one (last resort fallback)
      const num = unitNumber || '1'
      const { data: newUnit, error: uErr } = await supabase
        .from('units')
        .insert({ property_id: property.id, unit_number: num, rent_amount: 0, is_occupied: false })
        .select().single()
      if (uErr) return NextResponse.json({ error: 'Could not assign a unit: ' + uErr.message }, { status: 400 })
      unit = newUnit
    }

    // Double-check unit is still free (race condition guard)
    const { data: freshUnit } = await supabase
      .from('units')
      .select('is_occupied')
      .eq('id', unit.id)
      .single()

    if (freshUnit?.is_occupied) {
      return NextResponse.json({ error: 'That unit was just taken. Please try a different unit.' }, { status: 400 })
    }

    // Mark unit occupied FIRST (before insert) to prevent race conditions
    await supabase.from('units').update({ is_occupied: true }).eq('id', unit.id)

    // Create tenancy
    const today = new Date().toISOString().slice(0, 10)
    const { data: tenancy, error: tErr } = await supabase
      .from('tenancies')
      .insert({
        tenant_id,
        unit_id: unit.id,
        property_id: property.id,
        start_date: today,
        rent_amount: unit.rent_amount || 0,
        is_active: true,
      })
      .select()
      .single()

    if (tErr) {
      // Rollback unit occupation if tenancy creation failed
      await supabase.from('units').update({ is_occupied: false }).eq('id', unit.id)
      return NextResponse.json({ error: tErr.message }, { status: 400 })
    }

    return NextResponse.json({ data: tenancy, property_name: property.name, unit_number: unit.unit_number })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
