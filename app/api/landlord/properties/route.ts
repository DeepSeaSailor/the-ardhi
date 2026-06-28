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
    const { data, error } = await supabase.from('properties').insert({
      landlord_id,
      name: body.name,
      type: body.type,
      location: body.location,
      total_units: body.total_units,
      occupied_units: 0,
      invite_code: body.invite_code || generateCode(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
