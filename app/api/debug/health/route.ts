import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const report: any = {
    hasUrl: !!url,
    urlPrefix: url ? url.slice(0, 30) : null,
    hasServiceKey: !!serviceKey,
    serviceKeyLength: serviceKey?.length || 0,
    hasAnonKey: !!anonKey,
    anonKeyLength: anonKey?.length || 0,
  }

  // Try a raw fetch to Supabase's health/auth endpoint
  if (url) {
    try {
      const healthRes = await fetch(`${url}/auth/v1/health`, {
        headers: serviceKey ? { apikey: serviceKey } : {},
      })
      report.authHealthStatus = healthRes.status
      report.authHealthBody = await healthRes.text()
    } catch (e: any) {
      report.authHealthError = e.message
    }

    try {
      const restRes = await fetch(`${url}/rest/v1/`, {
        headers: serviceKey ? { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } : {},
      })
      report.restStatus = restRes.status
    } catch (e: any) {
      report.restError = e.message
    }
  }

  return NextResponse.json(report)
}
