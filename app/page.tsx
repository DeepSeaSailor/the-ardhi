'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { Building2, Home as HomeIcon, Settings, ArrowRight, Shield, Bell, CreditCard, Users, Eye, ChevronRight } from 'lucide-react'

const C = {
  forest: '#1B3A2D', forestLight: '#2A5240', ochre: '#C8922A', ochreLight: '#E8A93A',
  canvas: '#F9F6F1', charcoal: '#1A1A1A', mint: '#EBF4EF', red: '#D64045',
  border: '#E8E4DC', muted: '#8A8A82', white: '#FFFFFF', green: '#2A7D4F', purple: '#5B6AF0'
}

const FEATURES = [
  { text: 'MTN MoMo & Airtel Money' },
  { text: 'Security Alerts' },
  { text: 'Tenant Community' },
  { text: 'Surveillance Ready' },
  { text: 'Secure & Private' },
]

const ROLES = [
  { key: 'landlord', label: 'Landlord', sub: 'Manage your properties', color: C.forest, bg: C.mint },
  { key: 'tenant', label: 'Tenant', sub: 'Pay rent & stay connected', color: C.ochre, bg: '#FFF8EC' },
]

export default function Home() {
  const router = useRouter()
  const [role, setRole] = useState<'admin' | 'landlord' | 'tenant' | null>(null)
  const [step, setStep] = useState<'landing' | 'auth'>('landing')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roleColor = role === 'landlord' ? C.forest : role === 'tenant' ? C.ochre : C.purple
  const ROLE_ICONS: Record<string, React.ReactNode> = {
    landlord: <Building2 size={28} strokeWidth={1.5}/>,
    tenant: <HomeIcon size={28} strokeWidth={1.5}/>,
    admin: <Settings size={28} strokeWidth={1.5}/>,
  }

  async function handleAuth() {
    setLoading(true); setError('')
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login'
      const body: Record<string, string> = { email, password, role: role! }
      if (isSignUp) { body.full_name = fullName; body.phone = phone }
      if (role === 'tenant' && isSignUp) body.invite_code = inviteCode
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      if (role === 'admin') router.push('/admin')
      else if (role === 'landlord') router.push('/landlord')
      else router.push('/tenant')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  if (step === 'auth' && role) {
    const roleData = ROLES.find(r => r.key === role)!
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setStep('landing')} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', color: C.muted, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            ← Back
          </button>
          <Logo size={32} showText={false} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 20px 40px', maxWidth: 420, margin: '0 auto', width: '100%' }}>
          {/* Role badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: roleData.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleColor }}>
              {ROLE_ICONS[role]}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, color: C.charcoal, letterSpacing: '-0.3px' }}>
                {isSignUp ? 'Create account' : 'Welcome back'}
              </div>
              <div style={{ color: C.muted, fontSize: 14 }}>Signing in as {roleData.label}</div>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            {error && (
              <div style={{ background: '#FFF5F5', border: `1px solid ${C.red}30`, borderRadius: 10, padding: '12px 14px', color: C.red, fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                {error}
              </div>
            )}

            {isSignUp && <FormInput placeholder="Your full name" value={fullName} onChange={setFullName} />}
            <FormInput placeholder="Email address" value={email} onChange={setEmail} type="email" />
            {isSignUp && <FormInput placeholder="Phone number (e.g. 0772 000 001)" value={phone} onChange={setPhone} type="tel" />}
            {isSignUp && role === 'tenant' && <FormInput placeholder="Invite code from your landlord" value={inviteCode} onChange={setInviteCode} />}
            <FormInput placeholder="Password" value={password} onChange={setPassword} type="password" last />

            <button
              onClick={handleAuth}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: loading ? C.muted : roleColor,
                color: C.white, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
              {!loading && <ArrowRight size={18} />}
            </button>

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: C.muted }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span style={{ color: roleColor, fontWeight: 700, cursor: 'pointer' }} onClick={() => { setIsSignUp(!isSignUp); setError('') }}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </span>
            </p>
          </div>

          {role === 'tenant' && !isSignUp && (
            <div style={{ marginTop: 14, padding: '12px 16px', background: '#FFF8EC', borderRadius: 12, border: `1px solid ${C.ochre}20` }}>
              <p style={{ fontSize: 13, color: C.ochre, fontWeight: 500 }}>
                New tenant? You'll need an invite code from your landlord to sign up.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.forest, display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '48px 24px 32px' }}>
        <Logo size={44} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,146,42,0.15)', border: '1px solid rgba(200,146,42,0.3)', borderRadius: 40, padding: '6px 14px', marginBottom: 20, width: 'fit-content' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.ochre }} />
            <span style={{ color: C.ochre, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>NOW LIVE IN UGANDA</span>
          </div>

          <h1 style={{ color: C.white, fontSize: 'clamp(36px, 8vw, 52px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.05, marginBottom: 16 }}>
            Property<br />management<br />
            <span style={{ color: C.ochre }}>done right.</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, lineHeight: 1.6, maxWidth: 320, marginBottom: 32 }}>
            One platform for landlords and tenants across Uganda. Pay rent, report issues, stay safe — all in one place.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FEATURES.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 40, padding: '7px 14px', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>
                
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role selection panel */}
      <div style={{ background: C.canvas, borderRadius: '28px 28px 0 0', padding: '28px 20px 40px' }}>
        <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          Sign in as
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420, margin: '0 auto' }}>
          {ROLES.map(r => (
            <button
              key={r.key}
              onClick={() => { setRole(r.key as any); setStep('auth') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: C.white, border: `1.5px solid ${C.border}`,
                borderRadius: 16, padding: '16px 18px', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.15s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 13, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color, flexShrink: 0 }}>
                {ROLE_ICONS[r.key]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.charcoal }}>{r.label}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 1 }}>{r.sub}</div>
              </div>
              <ChevronRight size={18} color={C.muted} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function FormInput({ placeholder, value, onChange, type = 'text', last = false }: any) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      style={{
        width: '100%', padding: '13px 14px', borderRadius: 10,
        border: `1.5px solid #E8E4DC`, fontSize: 14, marginBottom: last ? 0 : 10,
        outline: 'none', background: '#FAFAF8', color: '#1A1A1A',
        boxSizing: 'border-box' as const, transition: 'border-color 0.15s',
      }}
    />
  )
}
