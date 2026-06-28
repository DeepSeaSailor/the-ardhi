import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const [{ count: ll }, { count: tl }, { count: pl }, payments, { data: units }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'landlord'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tenant'),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'confirmed'),
      supabase.from('units').select('is_occupied').eq('is_occupied', true),
    ])
    const total_payments = payments.data?.reduce((s: number, p: any) => s + (p.amount || 0), 0) || 0
    return NextResponse.json({ data: { total_landlords: ll || 0, total_tenants: tl || 0, total_properties: pl || 0, total_payments, occupied_units: units?.length || 0 } })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
