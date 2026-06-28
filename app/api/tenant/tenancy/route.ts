import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('user_id')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('tenancies')
      .select(`*, unit:units(unit_number,rent_amount), property:properties(name,location,type)`)
      .eq('tenant_id', user_id)
      .eq('is_active', true)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = { ...data, unit_number: data.unit?.unit_number, rent_amount: data.unit?.rent_amount || data.rent_amount, property_name: data.property?.name, property_location: data.property?.location }
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
