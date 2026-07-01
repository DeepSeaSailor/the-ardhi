import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const landlord_id = req.headers.get('x-user-id')
    if (!landlord_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('landlord_id', landlord_id)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // No subscription row yet — create a trial
    if (!data) {
      const trial_ends_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      const { data: newSub, error: createErr } = await supabase
        .from('subscriptions')
        .insert({ landlord_id, status: 'trial', plan: 'monthly', amount: 55000, trial_ends_at })
        .select().single()
      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 })
      return NextResponse.json({ data: newSub })
    }

    // If trial, check if it has expired
    if (data.status === 'trial' && data.trial_ends_at) {
      const trialExpired = new Date(data.trial_ends_at) < new Date()
      if (trialExpired) {
        await supabase.from('subscriptions').update({ status: 'expired' }).eq('landlord_id', landlord_id)
        return NextResponse.json({ data: { ...data, status: 'expired' } })
      }
    }

    // If active, check if end_date has passed
    if (data.status === 'active' && data.end_date) {
      const subExpired = new Date(data.end_date) < new Date()
      if (subExpired) {
        await supabase.from('subscriptions').update({ status: 'expired' }).eq('landlord_id', landlord_id)
        return NextResponse.json({ data: { ...data, status: 'expired' } })
      }
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const landlord_id = req.headers.get('x-user-id')
    if (!landlord_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { plan, payment_method, payment_reference, phone_or_account } = await req.json()

    if (!payment_reference || !phone_or_account) {
      return NextResponse.json({ error: 'Payment reference and phone/account number are required.' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const amount = plan === 'annual' ? 600000 : 55000

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        landlord_id,
        plan: plan || 'monthly',
        status: 'pending',
        amount,
        payment_method: payment_method || 'mobile_money',
        payment_reference,
        phone_or_account,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'landlord_id' })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data, message: 'Payment submitted. We will activate your account within 24 hours after verification.' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
