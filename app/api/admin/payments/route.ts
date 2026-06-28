import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('payments')
      .select(`*, tenant:profiles!payments_tenant_id_fkey(full_name), property:properties(name)`)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = data?.map((p: any) => ({ ...p, tenant_name: p.tenant?.full_name, property_name: p.property?.name }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
