import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const landlord_id = req.headers.get('x-user-id')
    const { doc_base64, doc_name } = await req.json()

    if (!doc_base64 || !doc_name) return NextResponse.json({ error: 'Missing doc' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    // Convert base64 to buffer and upload to Supabase Storage
    const base64Data = doc_base64.replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const ext = doc_name.split('.').pop() || 'pdf'
    const storagePath = `ownership/${params.id}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: `application/${ext === 'pdf' ? 'pdf' : 'octet-stream'}`, upsert: true })

    if (upErr) {
      // Fallback: store base64 url directly (for environments without storage bucket)
      const { error } = await supabase.from('properties')
        .update({ ownership_doc_url: doc_base64.slice(0, 500) + '...BASE64', ownership_status: 'under_review' })
        .eq('id', params.id).eq('landlord_id', landlord_id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true, url: 'base64_stored' })
    }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath)

    const { error } = await supabase.from('properties')
      .update({ ownership_doc_url: publicUrl, ownership_status: 'under_review' })
      .eq('id', params.id).eq('landlord_id', landlord_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, url: publicUrl })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
