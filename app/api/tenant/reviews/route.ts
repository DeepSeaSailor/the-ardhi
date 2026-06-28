import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const tenant_id = req.headers.get('x-user-id')
    const body = await req.json()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from('reviews').insert({ tenant_id, property_id: body.property_id, rating: body.rating, comment: body.comment }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
