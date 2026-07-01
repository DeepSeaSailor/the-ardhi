import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`*, landlord:profiles!subscriptions_landlord_id_fkey(full_name, email, phone)`)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const flat = (data || []).map((s: any) => ({
      ...s,
      landlord_name: s.landlord?.full_name,
      landlord_email: s.landlord?.email,
      landlord_phone: s.landlord?.phone,
      // check if trial has expired
      status: s.status === 'trial' && s.trial_ends_at && new Date(s.trial_ends_at) < new Date()
        ? 'expired'
        : s.status === 'active' && s.end_date && new Date(s.end_date) < new Date()
        ? 'expired'
        : s.status,
    }))
    return NextResponse.json({ data: flat })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
