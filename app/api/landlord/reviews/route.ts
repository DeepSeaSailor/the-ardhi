import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id')
    const supabase = getSupabaseAdmin()
    const { data: props } = await supabase.from('properties').select('id').eq('landlord_id', user_id)
    const propIds = (props || []).map((p: any) => p.id)
    if (!propIds.length) return NextResponse.json({ data: [] })
    const { data, error } = await supabase
      .from('reviews')
      .select('*, tenant:profiles!reviews_tenant_id_fkey(full_name), property:properties(name)')
      .in('property_id', propIds)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
