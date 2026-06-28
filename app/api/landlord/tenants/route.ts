import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const landlord_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('landlord_id')
    const supabase = getSupabaseAdmin()
    // Get properties for this landlord, then tenancies
    const { data: props } = await supabase.from('properties').select('id').eq('landlord_id', landlord_id)
    const propIds = props?.map((p: any) => p.id) || []
    if (propIds.length === 0) return NextResponse.json({ data: [] })
    const { data, error } = await supabase
      .from('tenancies')
      .select(`*, tenant:profiles!tenancies_tenant_id_fkey(full_name,phone,email,national_id), unit:units!tenancies_unit_id_fkey(unit_number,rent_amount)`)
      .in('property_id', propIds)
      .eq('is_active', true)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = data?.map((t: any) => ({
      id: t.id, tenant_id: t.tenant_id, property_id: t.property_id,
      full_name: t.tenant?.full_name, phone: t.tenant?.phone, national_id: t.tenant?.national_id,
      unit_number: t.unit?.unit_number, rent_amount: t.unit?.rent_amount || t.rent_amount,
    }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = getSupabaseAdmin()
    // Create unit
    const { data: unit, error: uErr } = await supabase.from('units').insert({
      property_id: body.property_id,
      unit_number: body.unit,
      rent_amount: body.rent_amount,
    }).select().single()
    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 400 })
    // Create or find tenant profile (by phone)
    let tenantId: string
    const { data: existing } = await supabase.from('profiles').select('id').eq('phone', body.phone).single()
    if (existing) {
      tenantId = existing.id
    } else {
      // Create minimal profile for manual onboarding
      const { data: newUser, error: nErr } = await supabase.auth.admin.createUser({
        email: body.email || `${body.phone.replace(/\s/g, '')}@ardhi.app`,
        password: body.national_id || 'Ardhi2024!',
        user_metadata: { full_name: body.full_name, role: 'tenant', phone: body.phone },
        email_confirm: true,
      })
      if (nErr) return NextResponse.json({ error: nErr.message }, { status: 400 })
      await supabase.from('profiles').update({ full_name: body.full_name, phone: body.phone, national_id: body.national_id, role: 'tenant' }).eq('id', newUser.user.id)
      tenantId = newUser.user.id
    }
    // Create tenancy
    const { data: tenancy, error: tErr } = await supabase.from('tenancies').insert({
      tenant_id: tenantId, unit_id: unit.id, property_id: body.property_id,
      rent_amount: body.rent_amount, is_active: true,
    }).select().single()
    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 400 })
    // Mark unit occupied
    await supabase.from('units').update({ is_occupied: true }).eq('id', unit.id)
    // Increment occupied count
    try { await supabase.rpc('increment_occupied', { prop_id: body.property_id }) } catch (_) {}
    return NextResponse.json({ data: tenancy })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
