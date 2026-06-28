import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const landlord_id = req.headers.get('x-user-id')
    const supabase = getSupabaseAdmin()
    // Only delete if landlord owns it
    const { error } = await supabase.from('properties').delete().eq('id', id).eq('landlord_id', landlord_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const landlord_id = req.headers.get('x-user-id')
    const body = await req.json()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('properties')
      .update({ name: body.name, type: body.type, location: body.location, total_units: body.total_units })
      .eq('id', id).eq('landlord_id', landlord_id)
      .select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
