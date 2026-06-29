import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    // Pending property ownership docs
    const { data: props } = await supabase
      .from('properties')
      .select('id, name, location, landlord_id, ownership_doc_url, ownership_status, created_at, profiles:landlord_id(full_name, email)')
      .not('ownership_doc_url', 'is', null)
      .order('created_at', { ascending: false })

    // Pending tenant ID docs
    const { data: tenants } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, id_doc_url, id_status, created_at')
      .eq('role', 'tenant')
      .not('id_doc_url', 'is', null)
      .order('created_at', { ascending: false })

    return NextResponse.json({ data: { properties: props || [], tenants: tenants || [] } })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
