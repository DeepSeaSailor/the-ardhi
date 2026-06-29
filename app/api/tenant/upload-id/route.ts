import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id')
    const { doc_base64, doc_name } = await req.json()

    if (!doc_base64 || !doc_name) return NextResponse.json({ error: 'Missing doc' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const base64Data = doc_base64.replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const ext = (doc_name.split('.').pop() || 'jpg') as string
    const storagePath = 'national-ids/' + user_id + '/' + Date.now() + '.' + ext

    const { error: upErr } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: 'image/' + ext, upsert: true })

    let docUrl = '[id uploaded]'
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath)
      docUrl = publicUrl
    }

    const { error } = await supabase.from('profiles')
      .update({ id_doc_url: docUrl, id_status: 'under_review' })
      .eq('id', user_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
