import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const user_id = req.headers.get('x-user-id')
    if (!user_id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })

    const { image_base64, file_name } = await req.json()
    if (!image_base64) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const base64Data = image_base64.replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const ext = ((file_name || 'jpg').split('.').pop() || 'jpg').toLowerCase()
    const storagePath = 'avatars/' + user_id + '/' + Date.now() + '.' + ext

    const { error: upErr } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: 'image/' + (ext === 'jpg' ? 'jpeg' : ext),
        upsert: true,
      })

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath)

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user_id)

    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 400 })

    return NextResponse.json({ url: publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
