'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, clearSession } from '@/lib/session'
import Logo from '@/components/Logo'
import Sidebar from '@/components/Sidebar'
import { Home, CreditCard, Users, Bell, AlertTriangle, CheckCircle, X, ChevronRight, Phone, Building2, MapPin, Shield, Smartphone, Landmark, Send, FileText, Clock, Download, LogOut } from 'lucide-react'

const C = { forest: '#1B3A2D', ochre: '#C8922A', canvas: '#F9F6F1', charcoal: '#1A1A1A', body: '#3D3D3D', mint: '#EBF4EF', red: '#D64045', border: '#E8E4DC', muted: '#8A8A82', white: '#FFFFFF', green: '#2A7D4F' }

function formatUGX(n: number) { return 'UGX ' + (n || 0).toLocaleString('en-UG') }

function Badge({ children, color }: any) {
  return <span style={{ background: color + '15', color, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{children}</span>
}

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: C.white, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: C.white, padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: C.charcoal }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#F5F5F3', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, cursor: 'pointer' }}><X size={16}/></button>
        </div>
        <div style={{ padding: '20px 24px 40px' }}>{children}</div>
      </div>
    </div>
  )
}

function Toast({ msg, visible }: any) {
  if (!visible) return null
  return <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: C.charcoal, color: C.white, padding: '12px 20px', borderRadius: 40, fontWeight: 600, fontSize: 13, zIndex: 2000, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={15}/> {msg}</div>
}

export default function TenantDashboard() {
  const [tab, setTab] = useState('home')
  const [profile, setProfile] = useState<any>(null)
  const [tenancy, setTenancy] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [neighbors, setNeighbors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showComplaintModal, setShowComplaintModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [payMethod, setPayMethod] = useState('mtn_momo')
  const [payPhone, setPayPhone] = useState('')
  const [complaint, setComplaint] = useState('')
  const [alertMsg, setAlertMsg] = useState('')
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [toast, setToast] = useState({ show: false, msg: '' })

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: '' }), 2500) }

  useEffect(() => {
    const session = getSession()
    if (!session) { router.push('/'); return }
    setUserId(session.id)
  }, [router])

  const fetchData = useCallback(async () => {
    if (!userId) return
    try {
      const headers = { 'x-user-id': userId || '' }
      const [pRes, tRes, payRes, cRes, aRes, nRes] = await Promise.all([
        fetch('/api/tenant/profile', { headers }), fetch('/api/tenant/tenancy', { headers }),
        fetch('/api/tenant/payments', { headers }), fetch('/api/tenant/complaints', { headers }),
        fetch('/api/tenant/alerts', { headers }), fetch('/api/tenant/neighbors', { headers }),
      ])
      const [prof, ten, pays, comps, als, neigh] = await Promise.all([pRes.json(), tRes.json(), payRes.json(), cRes.json(), aRes.json(), nRes.json()])
      setProfile(prof.data); setTenancy(ten.data); setPayments(pays.data || [])
      setComplaints(comps.data || []); setAlerts(als.data || []); setNeighbors(neigh.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [userId])

  useEffect(() => { if (userId) fetchData() }, [fetchData])

  const thisMonthPaid = payments.find((p: any) => {
    const d = new Date(p.created_at); const now = new Date()
    return p.status === 'confirmed' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  async function submitPayment() {
    if (!payPhone) return
    const res = await fetch('/api/tenant/payments', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' }, body: JSON.stringify({ payment_method: payMethod, phone_or_account: payPhone, amount: tenancy?.rent_amount, tenancy_id: tenancy?.id, property_id: tenancy?.property_id, month_year: new Date().toISOString().slice(0, 7) }) })
    if (res.ok) { showToast('Payment submitted — pending confirmation'); setShowPayModal(false); setPayPhone(''); fetchData() }
    else { const d = await res.json(); showToast(d.error || 'Failed') }
  }

  async function submitComplaint() {
    if (!complaint) return
    const res = await fetch('/api/tenant/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' }, body: JSON.stringify({ description: complaint, property_id: tenancy?.property_id, unit_id: tenancy?.unit_id }) })
    if (res.ok) { showToast('Complaint submitted'); setShowComplaintModal(false); setComplaint(''); fetchData() }
  }

  async function postAlert() {
    if (!alertMsg) return
    const res = await fetch('/api/tenant/alerts', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' }, body: JSON.stringify({ message: alertMsg, property_id: tenancy?.property_id, type: 'security' }) })
    if (res.ok) { showToast('Alert sent to all tenants'); setShowAlertModal(false); setAlertMsg(''); fetchData() }
  }

  const NAV = [
    { key: 'home', icon: <Home size={20}/>, label: 'Home' },
    { key: 'payments', icon: <CreditCard size={20}/>, label: 'Payments' },
    { key: 'community', icon: <Users size={20}/>, label: 'Community' },
    { key: 'alerts', icon: <Bell size={20}/>, label: 'Alerts' },
  ]

  const PAY_METHODS = [
    { v: 'mtn_momo', l: 'MTN MoMo', icon: <Smartphone size={18}/>, color: '#FFCC00', bg: '#FFFDE7' },
    { v: 'airtel_money', l: 'Airtel Money', icon: <Smartphone size={18}/>, color: '#E8122D', bg: '#FFF5F5' },
    { v: 'bank_transfer', l: 'Bank Transfer', icon: <Landmark size={18}/>, color: C.forest, bg: C.mint },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, flexDirection: 'column', gap: 16 }}>
      <Logo size={48} />
      <div style={{ color: C.muted, fontSize: 14 }}>Loading your portal...</div>
    </div>
  )

  const firstName = profile?.full_name?.split(' ')[0] || 'Tenant'

  const navItems = NAV.map(n => ({ key: n.key, icon: n.icon, label: n.label }))

  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: C.canvas }}>
      <Sidebar nav={navItems} tab={tab} setTab={setTab} onSignOut={() => { clearSession(); router.push('/') }} accentColor={C.ochre} role="Tenant"/>
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 80, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: C.forest, padding: '16px 20px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo size={34} />
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 15 }}>
            {firstName[0]}
          </div>
        </div>
        {tab === 'home' && (
          <div style={{ marginTop: 16 }}>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Welcome back,</div>
            <div style={{ color: C.white, fontSize: 20, fontWeight: 800, marginTop: 2 }}>{firstName} 👋</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 600, margin: '0 auto', width: '100%' }}>

        {tab === 'home' && (
          <div>
            {/* Property info */}
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.forest, flexShrink: 0 }}><Building2 size={20}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.charcoal }}>{tenancy?.property_name}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Unit {tenancy?.unit_number}</div>
              </div>
              <Badge color={C.forest}>{tenancy?.property_type || 'apartment'}</Badge>
            </div>

            {/* Rent card */}
            <div style={{ background: thisMonthPaid ? `linear-gradient(135deg, ${C.green}, #1F6B3E)` : `linear-gradient(135deg, ${C.forest}, #2A5240)`, borderRadius: 20, padding: '22px 20px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4 }}>Monthly rent</div>
              <div style={{ color: C.white, fontSize: 32, fontWeight: 900, letterSpacing: '-0.5px' }}>{formatUGX(tenancy?.rent_amount || 0)}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2, marginBottom: 16 }}>Due 1st of every month</div>
              {thisMonthPaid ? (
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, color: C.white, fontWeight: 700 }}>
                  <CheckCircle size={18}/> Paid this month ✓
                </div>
              ) : (
                <button onClick={() => setShowPayModal(true)} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: C.ochre, color: C.white, fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CreditCard size={18}/> Pay Rent Now
                </button>
              )}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setShowComplaintModal(true)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <FileText size={22} color={C.forest} style={{ marginBottom: 10 }}/>
                <div style={{ fontWeight: 700, color: C.charcoal, fontSize: 14 }}>File Complaint</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Report an issue</div>
              </button>
              <button onClick={() => setShowAlertModal(true)} style={{ background: '#FFF5F5', border: `1.5px solid ${C.red}25`, borderRadius: 16, padding: '16px', cursor: 'pointer', textAlign: 'left' }}>
                <AlertTriangle size={22} color={C.red} style={{ marginBottom: 10 }}/>
                <div style={{ fontWeight: 700, color: C.red, fontSize: 14 }}>Security Alert</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Alert all tenants</div>
              </button>
            </div>

            {/* Complaints */}
            {complaints.length > 0 && (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 12 }}>My Complaints</h3>
                {complaints.map((c: any) => (
                  <div key={c.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, borderLeft: `3px solid ${c.status === 'resolved' ? C.green : c.status === 'in_progress' ? C.ochre : C.red}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, fontSize: 14, color: C.body, lineHeight: 1.5 }}>{c.description}</div>
                    <div style={{ marginLeft: 10, flexShrink: 0 }}><Badge color={c.status === 'resolved' ? C.green : c.status === 'in_progress' ? C.ochre : C.red}>{c.status}</Badge></div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === 'payments' && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 16 }}>Payment History</h2>
            <div style={{ background: `linear-gradient(135deg, ${C.forest}, #2A5240)`, borderRadius: 20, padding: 20, marginBottom: 16, color: C.white }}>
              <div style={{ fontSize: 13, opacity: 0.65 }}>Monthly rent</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginTop: 2 }}>{formatUGX(tenancy?.rent_amount || 0)}</div>
              <div style={{ marginTop: 12 }}>
                <Badge color={thisMonthPaid ? '#68D391' : '#FC8181'}>{thisMonthPaid ? '✓ Paid this month' : 'Not yet paid this month'}</Badge>
              </div>
            </div>
            {!thisMonthPaid && (
              <button onClick={() => setShowPayModal(true)} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 14, background: C.ochre, color: C.white, fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <CreditCard size={18}/> Pay Now
              </button>
            )}
            <button onClick={async () => {
              const { downloadAgreementPDF } = await import('@/components/TenancyPDF')
              await downloadAgreementPDF({
                tenantName: profile?.full_name || 'Tenant',
                nationalId: profile?.national_id || 'N/A',
                phone: profile?.phone || 'N/A',
                email: profile?.email || 'N/A',
                landlordName: 'Landlord',
                propertyName: tenancy?.property_name || 'N/A',
                location: tenancy?.property_location || 'Uganda',
                unitNumber: tenancy?.unit_number || 'N/A',
                rentAmount: tenancy?.rent_amount || 0,
                depositAmount: 0,
                startDate: tenancy?.start_date || new Date().toLocaleDateString(),
                signedAt: new Date().toLocaleString(),
              })
            }} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: 14, background: C.white, color: C.forest, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Download size={16}/> Download Tenancy Agreement (PDF)
            </button>
            {payments.map((p: any) => (
              <div key={p.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.charcoal }}>{new Date(p.created_at).toLocaleDateString('en-UG', { month: 'long', year: 'numeric' })}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.payment_method?.replace(/_/g, ' ')}</div>
                  {p.reference && <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>Ref: {p.reference}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre, fontSize: 15 }}>{formatUGX(p.amount)}</div>
                  <Badge color={p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre}>{p.status}</Badge>
                </div>
              </div>
            ))}
            {payments.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, color: C.muted }}>No payment history yet</div>}
          </div>
        )}

        {tab === 'community' && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 4 }}>Your Building</h2>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12}/>{tenancy?.property_name}</div>
            {neighbors.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, color: C.muted }}>No other tenants in your building yet</div>}
            {neighbors.map((n: any) => (
              <div key={n.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.forest, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>#{n.unit_number}</div>
                <div>
                  <div style={{ fontWeight: 700, color: C.charcoal }}>Unit {n.unit_number}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>Fellow tenant</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '14px 16px', background: C.mint, borderRadius: 14, border: `1px solid ${C.forest}15`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Shield size={16} color={C.forest} style={{ flexShrink: 0, marginTop: 2 }}/>
              <p style={{ fontSize: 13, color: C.forest, lineHeight: 1.5 }}>Only names and unit numbers are visible to fellow tenants. Your contact details are private.</p>
            </div>
          </div>
        )}

        {tab === 'alerts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal }}>Community Alerts</h2>
              <button onClick={() => setShowAlertModal(true)} style={{ background: C.red, color: C.white, border: 'none', borderRadius: 10, padding: '9px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14}/> Post Alert
              </button>
            </div>
            {alerts.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, color: C.muted }}>No alerts yet. Stay safe!</div>}
            {alerts.map((a: any) => (
              <div key={a.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `3px solid ${a.type === 'security' ? C.red : C.forest}`, padding: '16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <Badge color={a.type === 'security' ? C.red : C.forest}>{a.type}</Badge>
                  <span style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10}/>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 14, color: C.body, lineHeight: 1.5 }}>{a.message}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>— {a.sender_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }} className="bottom-nav">
        {NAV.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ flex: 1, padding: '10px 4px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: tab === n.key ? C.forest : C.muted, position: 'relative' }}>
            <div style={{ transition: 'transform 0.15s', transform: tab === n.key ? 'scale(1.1)' : 'scale(1)' }}>{n.icon}</div>
            <div style={{ fontSize: 10, fontWeight: tab === n.key ? 700 : 500 }}>{n.label}</div>
            {tab === n.key && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, background: C.forest, borderRadius: '0 0 4px 4px' }} />}
          </button>
        ))}
        <button onClick={() => { clearSession(); router.push('/') }} style={{ flex: 1, padding: '10px 4px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: C.red }}>
          <LogOut size={20}/>
          <div style={{ fontSize: 10, fontWeight: 500 }}>Sign out</div>
        </button>
      </div>

      </div>

      {/* Pay Modal */}
      <Modal open={showPayModal} onClose={() => setShowPayModal(false)} title="Pay Rent">
        <div style={{ background: C.mint, borderRadius: 14, padding: '16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Amount due</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.forest, letterSpacing: '-0.5px' }}>{formatUGX(tenancy?.rent_amount || 0)}</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: C.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white }}><CreditCard size={22}/></div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment Method</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PAY_METHODS.map(m => (
              <button key={m.v} onClick={() => setPayMethod(m.v)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: `2px solid ${payMethod === m.v ? m.color : C.border}`, background: payMethod === m.v ? m.bg : C.white, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, border: `1px solid ${m.color}20` }}>{m.icon}</div>
                <div style={{ fontWeight: 700, color: C.charcoal, fontSize: 14 }}>{m.l}</div>
                {payMethod === m.v && <CheckCircle size={18} color={m.color} style={{ marginLeft: 'auto' }}/>}
              </button>
            ))}
          </div>
        </div>
        <input placeholder={payMethod === 'bank_transfer' ? 'Account number' : 'Phone number (e.g. 0772 100 001)'} value={payPhone} onChange={e => setPayPhone(e.target.value)}
          style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, marginBottom: 16, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowPayModal(false)} style={{ flex: 1, padding: '13px', border: `1px solid ${C.border}`, borderRadius: 12, background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Cancel</button>
          <button onClick={submitPayment} style={{ flex: 2, padding: '13px', border: 'none', borderRadius: 12, background: C.forest, color: C.white, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Send size={16}/> Confirm Payment</button>
        </div>
      </Modal>

      {/* Complaint Modal */}
      <Modal open={showComplaintModal} onClose={() => setShowComplaintModal(false)} title="File a Complaint">
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>Describe the issue clearly. Your landlord will be notified immediately.</p>
        <textarea value={complaint} onChange={e => setComplaint(e.target.value)} placeholder="e.g. Water supply has been cut since yesterday morning..." rows={5}
          style={{ width: '100%', padding: '13px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: 'inherit', resize: 'none', marginBottom: 16, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const, lineHeight: 1.5 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowComplaintModal(false)} style={{ flex: 1, padding: '13px', border: `1px solid ${C.border}`, borderRadius: 12, background: 'none', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
          <button onClick={submitComplaint} style={{ flex: 2, padding: '13px', border: 'none', borderRadius: 12, background: C.forest, color: C.white, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Send size={16}/> Submit</button>
        </div>
      </Modal>

      {/* Alert Modal */}
      <Modal open={showAlertModal} onClose={() => setShowAlertModal(false)} title="🚨 Post Security Alert">
        <div style={{ background: '#FFF5F5', border: `1px solid ${C.red}25`, borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertTriangle size={16} color={C.red} style={{ flexShrink: 0, marginTop: 1 }}/>
          <p style={{ fontSize: 13, color: C.red, fontWeight: 600, lineHeight: 1.5 }}>This alert will be sent to all tenants in your building immediately.</p>
        </div>
        <textarea value={alertMsg} onChange={e => setAlertMsg(e.target.value)} placeholder="Describe the security situation clearly..." rows={5}
          style={{ width: '100%', padding: '13px', borderRadius: 12, border: `1.5px solid ${C.red}50`, fontSize: 14, fontFamily: 'inherit', resize: 'none', marginBottom: 16, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const, lineHeight: 1.5 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowAlertModal(false)} style={{ flex: 1, padding: '13px', border: `1px solid ${C.border}`, borderRadius: 12, background: 'none', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
          <button onClick={postAlert} style={{ flex: 2, padding: '13px', border: 'none', borderRadius: 12, background: C.red, color: C.white, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><AlertTriangle size={16}/> Send Alert Now</button>
        </div>
      </Modal>

      <Toast msg={toast.msg} visible={toast.show} />
    </div>
  )
}
