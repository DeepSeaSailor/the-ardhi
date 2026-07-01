'use client'
import { useState } from 'react'
import { saveSession } from '@/lib/session'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { Building2, Home as HomeIcon, ArrowRight, ChevronRight, Upload, Eye, EyeOff, CheckCircle, FileText, Phone, Mail, User, IdCard } from 'lucide-react'

const C = {
  forest: '#1B3A2D', forestLight: '#2A5240', ochre: '#C8922A',
  canvas: '#F9F6F1', charcoal: '#1A1A1A', body: '#3D3D3D', mint: '#EBF4EF', red: '#D64045',
  border: '#E8E4DC', muted: '#8A8A82', white: '#FFFFFF', green: '#2A7D4F', purple: '#5B6AF0'
}

const FEATURES = [
  'MTN MoMo & Airtel Money', 'Security Alerts', 'Tenant Community', 'Surveillance Ready', 'Secure & Private'
]

const ROLES = [
  { key: 'landlord', label: 'Landlord', sub: 'Manage your properties', color: C.forest, bg: C.mint },
  { key: 'tenant', label: 'Tenant', sub: 'Pay rent & stay connected', color: C.ochre, bg: '#FFF8EC' },
]

const ROLE_ICONS: Record<string, any> = {
  landlord: <Building2 size={28} strokeWidth={1.5}/>,
  tenant: <HomeIcon size={28} strokeWidth={1.5}/>,
}

const AGREEMENT_TEXT = `TENANCY AGREEMENT — THE ARDHI PLATFORM

By signing this agreement, you confirm that all information provided is accurate and agree to the terms of tenancy as presented by your landlord through The Ardhi platform, including:

1. PREMISES: You will occupy the unit assigned to you at the property indicated.
2. RENT: Monthly rent is due on the 1st of each month via The Ardhi platform.
3. DEPOSIT: A security deposit set by your landlord is payable upon signing.
4. OBLIGATIONS: You agree to maintain the premises, not sublet without consent, and not cause nuisance.
5. TERMINATION: Either party may terminate with 30 days' written notice.
6. DIGITAL SIGNATURE: Your acceptance here, with timestamp and IP recorded, is legally binding under Uganda's Electronic Transactions Act, 2011.`

export default function Home() {
  const router = useRouter()
  const [role, setRole] = useState<'landlord' | 'tenant' | null>(null)
  const [step, setStep] = useState<'landing' | 'auth' | 'kyc' | 'agreement'>('landing')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [nationalIdFront, setNationalIdFront] = useState<string | null>(null)
  const [nationalIdBack, setNationalIdBack] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const roleColor = role === 'landlord' ? C.forest : C.ochre

  function handleFileUpload(side: 'front' | 'back', file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (side === 'front') setNationalIdFront(e.target?.result as string)
      else setNationalIdBack(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleAuth() {
    setLoading(true); setError('')
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login'
      const body: Record<string, string> = { email, password, role: role! }
      if (isSignUp) { body.full_name = fullName; body.phone = phone }
      if (role === 'tenant' && isSignUp) body.invite_code = inviteCode
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      let data: any = {}
      try { data = await res.json() } catch {}
      if (!res.ok) {
        const msg = typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.'
        throw new Error(msg)
      }
      if (data.user) saveSession(data.user, role!)
      if (isSignUp && role === 'tenant') {
        setUserId(data.user?.id)
        setStep('kyc')
      } else if (isSignUp && role === 'landlord') {
        router.push('/landlord')
      } else {
        router.push(role === 'landlord' ? '/landlord' : '/tenant')
      }
    } catch (e: any) {
      const msg = typeof e?.message === 'string' && e.message ? e.message : 'Something went wrong. Please try again.'
      setError(msg)
    } finally { setLoading(false) }
  }

  async function handleKYC() {
    if (!nationalIdFront || !nationalIdBack) { setError('Please upload both sides of your National ID'); return }
    setStep('agreement')
    setError('')
  }

  async function handleAgreement() {
    if (!agreedToTerms) { setError('Please read and accept the tenancy agreement'); return }
    setLoading(true)
    try {
      await fetch('/api/tenant/kyc', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ national_id_front: nationalIdFront, national_id_back: nationalIdBack, agreed_at: new Date().toISOString() })
      })
      router.push('/tenant')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  // KYC Step
  if (step === 'kyc') {
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: C.forest, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Logo size={32} showText={false}/>
          <div>
            <div style={{ color: C.white, fontWeight: 800, fontSize: 16 }}>Identity Verification</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Step 2 of 3</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '24px 20px', maxWidth: 440, margin: '0 auto', width: '100%' }}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {['Account', 'ID Upload', 'Agreement'].map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 4, borderRadius: 4, background: i <= 1 ? C.forest : C.border, marginBottom: 4 }}/>
                <div style={{ fontSize: 10, color: i <= 1 ? C.forest : C.muted, fontWeight: i <= 1 ? 700 : 400 }}>{s}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 6 }}>Upload National ID</h2>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            We need both sides of your National ID for verification. This keeps our community safe.
          </p>

          {error && typeof error === 'string' && error.length > 2 && <div style={{ background: '#FFF5F5', border: `1px solid ${C.red}30`, borderRadius: 10, padding: '10px 14px', color: C.red, fontSize: 13, marginBottom: 16 }}>{error}</div>}

          {/* Front */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Front Side</label>
            <label style={{ display: 'block', cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload('front', e.target.files[0])} style={{ display: 'none' }}/>
              {nationalIdFront ? (
                <div style={{ borderRadius: 12, overflow: 'hidden', border: `2px solid ${C.green}`, position: 'relative' }}>
                  <img src={nationalIdFront} alt="ID Front" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}/>
                  <div style={{ position: 'absolute', top: 8, right: 8, background: C.green, borderRadius: 20, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={14} color="white"/></div>
                </div>
              ) : (
                <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center', background: C.white }}>
                  <Upload size={28} color={C.muted} style={{ margin: '0 auto 8px' }}/>
                  <div style={{ fontWeight: 600, color: C.charcoal, fontSize: 14 }}>Tap to upload front</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>JPG or PNG, clear photo</div>
                </div>
              )}
            </label>
          </div>

          {/* Back */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Back Side</label>
            <label style={{ display: 'block', cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload('back', e.target.files[0])} style={{ display: 'none' }}/>
              {nationalIdBack ? (
                <div style={{ borderRadius: 12, overflow: 'hidden', border: `2px solid ${C.green}`, position: 'relative' }}>
                  <img src={nationalIdBack} alt="ID Back" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}/>
                  <div style={{ position: 'absolute', top: 8, right: 8, background: C.green, borderRadius: 20, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={14} color="white"/></div>
                </div>
              ) : (
                <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center', background: C.white }}>
                  <Upload size={28} color={C.muted} style={{ margin: '0 auto 8px' }}/>
                  <div style={{ fontWeight: 600, color: C.charcoal, fontSize: 14 }}>Tap to upload back</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>JPG or PNG, clear photo</div>
                </div>
              )}
            </label>
          </div>

          <button onClick={handleKYC} disabled={!nationalIdFront || !nationalIdBack}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: (!nationalIdFront || !nationalIdBack) ? C.muted : C.forest, color: C.white, fontWeight: 700, fontSize: 15, cursor: (!nationalIdFront || !nationalIdBack) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Continue <ArrowRight size={18}/>
          </button>
        </div>
      </div>
    )
  }

  // Agreement Step
  if (step === 'agreement') {
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: C.forest, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Logo size={32} showText={false}/>
          <div>
            <div style={{ color: C.white, fontWeight: 800, fontSize: 16 }}>Tenancy Agreement</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Step 3 of 3</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '24px 20px', maxWidth: 440, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {['Account', 'ID Upload', 'Agreement'].map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 4, borderRadius: 4, background: i <= 2 ? C.forest : C.border, marginBottom: 4 }}/>
                <div style={{ fontSize: 10, color: i <= 2 ? C.forest : C.muted, fontWeight: 700 }}>{s}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.forest }}><FileText size={22}/></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: C.charcoal }}>Review & Sign</div>
              <div style={{ fontSize: 13, color: C.muted }}>Read carefully before signing</div>
            </div>
          </div>

          {error && typeof error === 'string' && error.length > 2 && <div style={{ background: '#FFF5F5', border: `1px solid ${C.red}30`, borderRadius: 10, padding: '10px 14px', color: C.red, fontSize: 13, marginBottom: 16 }}>{error}</div>}

          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 18, marginBottom: 16, maxHeight: 280, overflowY: 'auto' }}>
            <pre style={{ fontFamily: 'inherit', fontSize: 12, color: C.body, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{AGREEMENT_TEXT}</pre>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 20, padding: '14px', background: agreedToTerms ? C.mint : C.white, borderRadius: 12, border: `1.5px solid ${agreedToTerms ? C.forest : C.border}`, transition: 'all 0.15s' }}>
            <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, cursor: 'pointer', accentColor: C.forest }}/>
            <div style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}>
              I have read and understood this agreement. I agree to be bound by these terms. I confirm my digital signature is legally valid under Uganda's Electronic Transactions Act, 2011.
            </div>
          </label>

          <button onClick={handleAgreement} disabled={!agreedToTerms || loading}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: (!agreedToTerms || loading) ? C.muted : C.forest, color: C.white, fontWeight: 700, fontSize: 15, cursor: (!agreedToTerms || loading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? 'Finalising...' : <><CheckCircle size={18}/> Sign & Enter Platform</>}
          </button>
        </div>
      </div>
    )
  }

  // Auth Step
  if (step === 'auth' && role) {
    const roleData = ROLES.find(r => r.key === role)!
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setStep('landing')} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>← Back</button>
          <Logo size={32} showText={false}/>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 20px 40px', maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: roleData.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: roleColor }}>{ROLE_ICONS[role]}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, color: C.charcoal, letterSpacing: '-0.3px' }}>{isSignUp ? 'Create account' : 'Welcome back'}</div>
              <div style={{ color: C.muted, fontSize: 14 }}>as {roleData.label}</div>
            </div>
          </div>

          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            {error && typeof error === 'string' && error.length > 2 && <div style={{ background: '#FFF5F5', border: `1px solid ${C.red}30`, borderRadius: 10, padding: '10px 14px', color: C.red, fontSize: 13, marginBottom: 16, fontWeight: 500 }}>{error}</div>}

            {isSignUp && (
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
                <input placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 38px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
              </div>
            )}

            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 38px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
            </div>

            {isSignUp && (
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <Phone size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
                <input type="tel" placeholder="Phone (e.g. 0772 000 001)" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 38px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
              </div>
            )}

            {isSignUp && role === 'tenant' && (
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <IdCard size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
                <input placeholder="Invite code from landlord" value={inviteCode} onChange={e => setInviteCode(e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 38px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
              </div>
            )}

            {/* Password with visibility toggle */}
            <div style={{ position: 'relative', marginBottom: 0 }}>
              <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()}
                style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
              <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>

            <button onClick={handleAuth} disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: loading ? C.muted : roleColor, color: C.white, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? 'Please wait...' : isSignUp ? 'Continue' : 'Sign in'} {!loading && <ArrowRight size={18}/>}
            </button>

            {!isSignUp && (
              <p style={{ textAlign: 'center', marginTop: 10, fontSize: 13 }}>
                <span
                  style={{ color: C.muted, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => { setShowForgot(true); setForgotSent(false); setForgotEmail('') }}>
                  Forgot your password?
                </span>
              </p>
            )}

            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: C.muted }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span style={{ color: roleColor, fontWeight: 700, cursor: 'pointer' }} onClick={() => { setIsSignUp(!isSignUp); setError('') }}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </span>
            </p>
          </div>

          {role === 'tenant' && isSignUp && (
            <div style={{ marginTop: 14, padding: '12px 16px', background: '#FFF8EC', borderRadius: 12, border: `1px solid ${C.ochre}20` }}>
              <p style={{ fontSize: 13, color: C.ochre, fontWeight: 500, lineHeight: 1.5 }}>
                After creating your account you will upload your National ID and sign your tenancy agreement.
              </p>
            </div>
          )}

          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <a href="/listings" style={{ fontSize: 13, color: C.muted, textDecoration: 'none' }}>Browse available properties →</a>
          </div>
        </div>
      </div>
    )
  }

  // Landing
  return (
    <div style={{ minHeight: '100vh', background: C.forest, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 32px', textAlign: 'center' }}>
        {/* Big logo centred */}
        <img src="/ardhi-logo.png" alt="Ardhi" style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 20 }}/>
        <h1 style={{ color: C.white, fontSize: 'clamp(40px, 9vw, 56px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1, marginBottom: 12 }}>
          The Ardhi
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.6, maxWidth: 280, marginBottom: 0 }}>
          Property management for landlords and tenants across Uganda.
        </p>
      </div>

      <div style={{ background: C.canvas, borderRadius: '28px 28px 0 0', padding: '28px 20px 48px' }}>
        <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Get started</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420, margin: '0 auto' }}>
          {ROLES.map(r => (
            <button key={r.key} onClick={() => { setRole(r.key as any); setStep('auth'); setError('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 16, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color, flexShrink: 0 }}>{ROLE_ICONS[r.key]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.charcoal }}>{r.label}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 1 }}>{r.sub}</div>
              </div>
              <ChevronRight size={18} color={C.muted}/>
            </button>
          ))}
          <a href="/listings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px', borderRadius: 16, border: `1.5px solid ${C.border}`, background: 'transparent', color: C.muted, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Browse available properties
          </a>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 460, padding: '28px 24px 48px' }}>
            {!forgotSent ? (
              <>
                <div style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 6 }}>Reset Password</div>
                <div style={{ fontSize: 14, color: C.muted, marginBottom: 22, lineHeight: 1.5 }}>
                  Enter your account email and we'll send you a reset link.
                </div>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, display: 'block' }}>Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, background: '#FAFAF8', marginBottom: 16 }}
                />
                <button
                  onClick={handleForgotPassword}
                  disabled={forgotLoading || !forgotEmail.trim()}
                  style={{ width: '100%', padding: '14px', background: forgotLoading ? C.muted : C.forest, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: forgotLoading ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
                  {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
                <button onClick={() => setShowForgot(false)}
                  style={{ width: '100%', padding: '12px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 12, fontWeight: 600, fontSize: 14, color: C.muted, cursor: 'pointer' }}>
                  Cancel
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 8 }}>Check your email</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
                  If <strong>{forgotEmail}</strong> is registered on The Ardhi, you'll receive a reset link shortly. Check your spam folder too.
                </div>
                <button onClick={() => setShowForgot(false)}
                  style={{ width: '100%', padding: '14px', background: C.forest, color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
