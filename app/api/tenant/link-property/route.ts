import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    const { invite_code } = await req.json()
    const supabase = getSupabaseAdmin()

    // Find property by invite code
    const { data: property } = await supabase
      .from('properties')
      .select('id, landlord_id, name')
      .eq('invite_code', invite_code.toUpperCase())
      .single()
    if (!property) return NextResponse.json({ error: 'Invalid invite code. Please check with your landlord.' }, { status: 400 })

    // Check not already linked
    const { data: existing } = await supabase
      .from('tenancies')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('property_id', property.id)
      .eq('is_active', true)
      .single()
    if (existing) return NextResponse.json({ error: 'You are already linked to this property.' }, { status: 400 })

    // Find a vacant unit
    const { data: unit } = await supabase
      .from('units')
      .select('id, unit_number, rent_amount')
      .eq('property_id', property.id)
      .eq('is_occupied', false)
      .limit(1)
      .single()
    if (!unit) return NextResponse.json({ error: 'No vacant units available on this property.' }, { status: 400 })

    // Create tenancy
    const { data: tenancy, error } = await supabase.from('tenancies').insert({
      tenant_id, unit_id: unit.id, property_id: property.id,
      landlord_id: property.landlord_id,
      rent_amount: unit.rent_amount,
      is_active: true, start_date: new Date().toISOString().slice(0, 10),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Mark unit occupied
    await supabase.from('units').update({ is_occupied: true }).eq('id', unit.id)

    return NextResponse.json({ data: tenancy, property_name: property.name })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
