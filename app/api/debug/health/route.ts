import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const report: any = {}

  if (url && serviceKey) {
    // List all auth users
    try {
      const res = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=50`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      })
      const data = await res.json()
      report.authUsers = (data.users || []).map((u: any) => ({ id: u.id, email: u.email, created_at: u.created_at }))
      report.authUserCount = report.authUsers.length
    } catch (e: any) {
      report.authUsersError = e.message
    }

    // List all profiles rows
    try {
      const res2 = await fetch(`${url}/rest/v1/profiles?select=id,email,full_name,role`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      })
      report.profiles = await res2.json()
      report.profilesStatus = res2.status
    } catch (e: any) {
      report.profilesError = e.message
    }

    // Try creating a genuinely fresh test email to confirm the trigger itself works
    try {
      const freshEmail = `freshtest_${Date.now()}@ardhi-debug.app`
      const res3 = await fetch(`${url}/auth/v1/admin/users`, {
        method: 'POST',
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: freshEmail, password: 'testpass123', email_confirm: true, user_metadata: { full_name: 'Fresh Test', role: 'tenant' } }),
      })
      report.freshCreateStatus = res3.status
      const text = await res3.text()
      report.freshCreateBody = text.slice(0, 500)
      report.freshTestEmail = freshEmail
    } catch (e: any) {
      report.freshCreateError = e.message
    }
  }

  return NextResponse.json(report)
}
