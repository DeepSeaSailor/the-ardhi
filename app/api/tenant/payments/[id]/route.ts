import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const tenant_id = req.headers.get('x-user-id')
    const supabase = getSupabaseAdmin()
    // Tenant can only delete their own pending payments
    const { error } = await supabase.from('payments').delete().eq('id', id).eq('tenant_id', tenant_id).eq('status', 'pending')
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
