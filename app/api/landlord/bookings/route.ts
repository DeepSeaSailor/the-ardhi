import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const landlord_id = req.headers.get('x-user-id')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, tenant:profiles!bookings_tenant_id_fkey(full_name, phone, email, national_id), listing:listings(title, unit_number, rent_amount)`)
      .eq('landlord_id', landlord_id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = data?.map((b: any) => ({ ...b, tenant_name: b.tenant?.full_name, tenant_phone: b.tenant?.phone, tenant_email: b.tenant?.email, listing_title: b.listing?.title, listing_unit: b.listing?.unit_number, listing_rent: b.listing?.rent_amount }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
