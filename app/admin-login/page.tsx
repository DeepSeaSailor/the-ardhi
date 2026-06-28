'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { Shield, ArrowRight, Eye, EyeOff } from 'lucide-react'

const ADMIN_SECRET = 'Ardhi@Admin2026#KAC'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    if (password !== ADMIN_SECRET) { setError('Invalid credentials'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'admin' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      router.push('/admin')
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F1A14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Logo size={44} />
          <div style={{ marginTop: 20, width: 52, height: 52, borderRadius: 16, background: 'rgba(91,106,240,0.15)', border: '1px solid rgba(91,106,240,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px auto 0', color: '#5B6AF0' }}>
            <Shield size={24}/>
          </div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginTop: 12 }}>Secure Access</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>Authorised personnel only</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: 24 }}>
          {error && <div style={{ background: 'rgba(214,64,69,0.1)', border: '1px solid rgba(214,64,69,0.3)', borderRadius: 10, padding: '10px 14px', color: '#D64045', fontSize: 13, marginBottom: 16, fontWeight: 500 }}>{error}</div>}
          <input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '13px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, marginBottom: 10, outline: 'none', background: 'rgba(255,255,255,0.06)', color: '#fff', boxSizing: 'border-box' as const }} />
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input type={show ? 'text' : 'password'} placeholder="Admin password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '13px 44px 13px 14px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.06)', color: '#fff', boxSizing: 'border-box' as const }} />
            <button onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              {show ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          <button onClick={handleLogin} disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: '#5B6AF0', color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Verifying...' : 'Access Console'} {!loading && <ArrowRight size={18}/>}
          </button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>This page is not publicly linked.</p>
      </div>
    </div>
  )
}
