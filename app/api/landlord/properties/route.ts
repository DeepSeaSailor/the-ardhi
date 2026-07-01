import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

function generateCode() { return Math.random().toString(36).substring(2, 8).toUpperCase() }

export async function GET(req: NextRequest) {
  try {
    const landlord_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('landlord_id')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('properties').select('*').eq('landlord_id', landlord_id).order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const landlord_id = req.headers.get('x-user-id') || body.landlord_id
    const supabase = getSupabaseAdmin()

    const totalUnits = parseInt(body.total_units) || 1
    const inviteCode = body.invite_code || generateCode()

    // Create the property
    const { data: property, error } = await supabase.from('properties').insert({
      landlord_id,
      name: body.name,
      type: body.type,
      location: body.location,
      total_units: totalUnits,
      occupied_units: 0,
      invite_code: inviteCode,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Auto-create individual unit rows so each unit has a real DB record
    // This is what makes unit-specific invite codes (7A87UZ-U1, 7A87UZ-U2, etc.) work properly
    const unitRows = Array.from({ length: totalUnits }, (_, i) => ({
      property_id: property.id,
      unit_number: String(i + 1),
      rent_amount: body.rent_amount || 0,
      is_occupied: false,
    }))

    const { error: unitErr } = await supabase.from('units').insert(unitRows)
    if (unitErr) {
      // Log but don't fail — property was created, units can be added manually
      console.error('Unit auto-creation failed:', unitErr.message)
    }

    return NextResponse.json({ data: property })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
