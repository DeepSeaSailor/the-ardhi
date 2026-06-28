import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, listing:listings(title, location, rent_amount, unit_number, images), property:properties(name)`)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = data?.map((b: any) => ({ ...b, listing_title: b.listing?.title, listing_location: b.listing?.location, listing_rent: b.listing?.rent_amount, listing_unit: b.listing?.unit_number, listing_image: b.listing?.images?.[0], property_name: b.property?.name }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    const body = await req.json()
    const supabase = getSupabaseAdmin()
    const { data: listing } = await supabase.from('listings').select('landlord_id, property_id').eq('id', body.listing_id).single()
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    const existing = await supabase.from('bookings').select('id').eq('listing_id', body.listing_id).eq('tenant_id', tenant_id).eq('status', 'pending').single()
    if (existing.data) return NextResponse.json({ error: 'You already applied for this listing' }, { status: 400 })
    const { data, error } = await supabase.from('bookings').insert({ listing_id: body.listing_id, tenant_id, landlord_id: listing.landlord_id, property_id: listing.property_id, message: body.message, status: 'pending' }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
