import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const landlord_id = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('landlord_id')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('listings').select('*').eq('landlord_id', landlord_id).order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const landlord_id = req.headers.get('x-user-id') || body.landlord_id
    const supabase = getSupabaseAdmin()
    const invite_link = Math.random().toString(36).substring(2, 10).toUpperCase()
    const { data, error } = await supabase.from('listings').insert({
      property_id: body.property_id, landlord_id,
      unit_number: body.unit_number, title: body.title,
      description: body.description, rent_amount: body.rent_amount,
      deposit_amount: body.deposit_amount || 0,
      property_type: body.property_type, location: body.location,
      amenities: body.amenities || [], invite_link,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
