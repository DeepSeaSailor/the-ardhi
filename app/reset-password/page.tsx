'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Logo from '@/components/Logo'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

const C = {
  forest: '#1B3A2D', canvas: '#F9F6F1', charcoal: '#1A1A1A',
  border: '#E8E4DC', muted: '#8A8A82', white: '#FFFFFF', red: '#D64045', green: '#2A7D4F'
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase embeds the token in the URL hash when redirecting
    // We need to exchange it for a session before we can update the password
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      // Parse tokens from hash
      const params = new URLSearchParams(hash.substring(1))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
          if (!error) setSessionReady(true)
          else setError('Reset link is invalid or has expired. Please request a new one.')
        })
      }
    } else {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [])

  async function handleReset() {
    setError('')
    if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error } = await supabase.auth.updateUser({ password })
      if (error) { setError(error.message); setLoading(false); return }
      setDone(true)
      setTimeout(() => router.push('/'), 3000)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Logo size={48}/>
          <div style={{ fontWeight: 800, fontSize: 22, color: C.charcoal, marginTop: 16 }}>Set New Password</div>
          <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>Choose a strong password for your account</div>
        </div>

        {done ? (
          <div style={{ background: C.white, borderRadius: 20, padding: 32, textAlign: 'center', border: `1px solid ${C.border}` }}>
            <CheckCircle size={48} color={C.green} style={{ margin: '0 auto 16px' }}/>
            <div style={{ fontWeight: 800, fontSize: 18, color: C.charcoal, marginBottom: 8 }}>Password Updated!</div>
            <div style={{ fontSize: 14, color: C.muted }}>Redirecting you to sign in…</div>
          </div>
        ) : (
          <div style={{ background: C.white, borderRadius: 20, padding: 28, border: `1px solid ${C.border}` }}>
            {error && (
              <div style={{ background: '#FFF0F0', border: `1px solid ${C.red}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertCircle size={16} color={C.red} style={{ flexShrink: 0, marginTop: 1 }}/>
                <div style={{ fontSize: 13, color: C.red, lineHeight: 1.5 }}>{error}</div>
              </div>
            )}

            {!sessionReady && !error && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: C.muted, fontSize: 14 }}>Verifying reset link…</div>
            )}

            {sessionReady && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, display: 'block' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      style={{ width: '100%', padding: '13px 44px 13px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' }}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0 }}>
                      {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, display: 'block' }}>Confirm Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your new password"
                    style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${confirm && confirm !== password ? C.red : C.border}`, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8' }}
                  />
                  {confirm && confirm !== password && (
                    <div style={{ fontSize: 12, color: C.red, marginTop: 5 }}>Passwords do not match</div>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  disabled={loading || !password || !confirm}
                  style={{ width: '100%', padding: '15px', background: loading ? C.muted : C.forest, color: C.white, border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </>
            )}

            <button onClick={() => router.push('/')}
              style={{ width: '100%', marginTop: 12, padding: '11px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 12, fontWeight: 600, fontSize: 14, color: C.muted, cursor: 'pointer' }}>
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
