import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status, plan } = await req.json()
    const supabase = getSupabaseAdmin()

    const updateData: any = { status, updated_at: new Date().toISOString() }

    if (status === 'active') {
      const start = new Date()
      const end = new Date()
      const months = plan === 'annual' ? 12 : 1
      end.setMonth(end.getMonth() + months)
      updateData.start_date = start.toISOString().slice(0, 10)
      updateData.end_date = end.toISOString().slice(0, 10)
      updateData.amount = plan === 'annual' ? 600000 : 55000
      updateData.plan = plan || 'monthly'
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
