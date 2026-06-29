import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    const { invite_code } = await req.json()
    const supabase = getSupabaseAdmin()

    // Accept both "7A87UZ" and "7A87UZ-U1"
    const raw = (invite_code || '').toUpperCase().trim()
    const unitMatch = raw.match(/^(.+)-U(\d+)$/)
    const baseCode = unitMatch ? unitMatch[1] : raw
    const unitNumber = unitMatch ? parseInt(unitMatch[2]) : null

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

    // Try to find/create a unit
    let unit_id: string | null = null
    let rent_amount = 0

    // Look for existing unit by number
    const targetUnit = String(unitNumber || 1)
    const { data: existingUnit } = await supabase
      .from('units')
      .select('id, unit_number, rent_amount, is_occupied')
      .eq('property_id', property.id)
      .eq('unit_number', targetUnit)
      .maybeSingle()

    if (existingUnit) {
      unit_id = existingUnit.id
      rent_amount = existingUnit.rent_amount || 0
    } else {
      // Try any vacant unit
      const { data: vacantUnit } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount')
        .eq('property_id', property.id)
        .eq('is_occupied', false)
        .limit(1)
        .maybeSingle()

      if (vacantUnit) {
        unit_id = vacantUnit.id
        rent_amount = vacantUnit.rent_amount || 0
      } else {
        // Create a unit row
        const { data: newUnit, error: uErr } = await supabase
          .from('units')
          .insert({ property_id: property.id, unit_number: targetUnit, rent_amount: 0, is_occupied: false })
          .select('id')
          .single()
        if (!uErr && newUnit) {
          unit_id = newUnit.id
        }
        // If unit creation also fails, proceed without unit_id
      }
    }

    // Build tenancy insert — only known-safe columns
    const tenancyData: any = {
      tenant_id,
      property_id: property.id,
      rent_amount,
      is_active: true,
    }
    if (unit_id) tenancyData.unit_id = unit_id

    const { data: tenancy, error: tErr } = await supabase
      .from('tenancies')
      .insert(tenancyData)
      .select()
      .single()

    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 400 })

    // Mark unit occupied
    if (unit_id) {
      await supabase.from('units').update({ is_occupied: true }).eq('id', unit_id)
    }

    // Increment occupied count
    try { await supabase.rpc('increment_occupied', { prop_id: property.id }) } catch (_) {}

    return NextResponse.json({ data: tenancy, property_name: property.name })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
