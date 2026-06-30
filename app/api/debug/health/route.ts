import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const report: any = {}

  if (url && serviceKey) {
    // Try the raw admin users endpoint directly (what listUsers/createUser hit under the hood)
    try {
      const res = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      })
      report.adminListStatus = res.status
      report.adminListStatusText = res.statusText
      const text = await res.text()
      report.adminListBody = text.slice(0, 500)
    } catch (e: any) {
      report.adminListFetchError = e.message
      report.adminListFetchErrorName = e.name
      report.adminListFetchErrorCause = e.cause ? String(e.cause) : null
    }

    // Try a raw createUser POST directly to see the real error
    try {
      const testEmail = `healthcheck_${Date.now()}@example.invalid`
      const res2 = await fetch(`${url}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail, password: 'testpass123', email_confirm: true }),
      })
      report.createStatus = res2.status
      report.createStatusText = res2.statusText
      const text2 = await res2.text()
      report.createBody = text2.slice(0, 800)
    } catch (e: any) {
      report.createFetchError = e.message
      report.createFetchErrorName = e.name
      report.createFetchErrorCause = e.cause ? String(e.cause) : null
    }
  } else {
    report.error = 'missing url or service key'
  }

  return NextResponse.json(report)
}
