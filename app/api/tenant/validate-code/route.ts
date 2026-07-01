import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { invite_code } = await req.json()
    const raw = (invite_code || '').toUpperCase().trim()
    const unitMatch = raw.match(/^(.+)-U(\d+)$/)
    const baseCode = unitMatch ? unitMatch[1] : raw
    const unitNumber = unitMatch ? unitMatch[2] : null

    const supabase = getSupabaseAdmin()
    const { data: property } = await supabase
      .from('properties')
      .select('id, name, location, type, total_units')
      .eq('invite_code', baseCode)
      .maybeSingle()

    if (!property) {
      return NextResponse.json({ error: 'Invalid invite code. Please check with your landlord.' }, { status: 400 })
    }

    // Fetch available (unoccupied) units for this property
    const { data: units } = await supabase
      .from('units')
      .select('id, unit_number, rent_amount, is_occupied')
      .eq('property_id', property.id)
      .order('unit_number', { ascending: true })

    return NextResponse.json({
      property,
      units: units || [],
      targetUnit: unitNumber, // null if generic code used
      isUnitSpecific: !!unitNumber,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
