'use client'
import { useState, useEffect, useCallback } from 'react'
import Logo from '@/components/Logo'
import {
  LayoutDashboard, Users, Building2, CreditCard, TrendingUp, CheckCircle,
  XCircle, Clock, AlertTriangle, X, ChevronRight, Phone, Mail,
  Calendar, Shield, BarChart3, ArrowUpRight, RefreshCw, Star,
  UserCheck, UserX, Banknote, Eye, Activity
} from 'lucide-react'

const C = { forest: '#1B3A2D', ochre: '#C8922A', canvas: '#F9F6F1', charcoal: '#1A1A1A', body: '#3D3D3D', mint: '#EBF4EF', red: '#D64045', border: '#E8E4DC', muted: '#8A8A82', white: '#FFFFFF', green: '#2A7D4F', purple: '#5B6AF0', blue: '#2563EB' }

function formatUGX(n: number) { return 'UGX ' + (n || 0).toLocaleString('en-UG') }

function Badge({ children, color }: any) {
  return <span style={{ background: color + '15', color, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', display: 'inline-block' }}>{children}</span>
}

function StatCard({ icon, value, label, sub, color, trend }: any) {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        {trend && <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: C.green + '15', borderRadius: 6, padding: '3px 8px', color: C.green, fontSize: 11, fontWeight: 700 }}><ArrowUpRight size={11}/>{trend}</div>}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: C.charcoal, letterSpacing: '-0.5px' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: C.white, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: C.white, padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: C.charcoal, margin: 0 }}>{title}</h3>
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

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState<any>({})
  const [landlords, setLandlords] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLandlord, setSelectedLandlord] = useState<any>(null)
  const [toast, setToast] = useState({ show: false, msg: '' })

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: '' }), 2500) }

  const fetchData = useCallback(async () => {
    try {
      const [sRes, lRes, tRes, pRes, payRes, subRes] = await Promise.all([
        fetch('/api/admin/stats'), fetch('/api/admin/landlords'), fetch('/api/admin/tenants'),
        fetch('/api/admin/properties'), fetch('/api/admin/payments'), fetch('/api/admin/subscriptions'),
      ])
      const [s, l, t, p, pay, sub] = await Promise.all([sRes.json(), lRes.json(), tRes.json(), pRes.json(), payRes.json(), subRes.json()])
      setStats(s.data || {}); setLandlords(l.data || []); setTenants(t.data || [])
      setProperties(p.data || []); setPayments(pay.data || []); setSubscriptions(sub.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function confirmPayment(id: string) {
    await fetch(`/api/admin/payments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) })
    showToast('Payment confirmed'); fetchData()
  }

  async function toggleLandlord(id: string, current: boolean) {
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !current }) })
    showToast(current ? 'Landlord suspended' : 'Landlord reinstated'); fetchData()
  }

  async function activateSubscription(id: string, plan: string) {
    await fetch(`/api/admin/subscriptions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active', plan }) })
    showToast('Subscription activated'); fetchData()
  }

  const totalRevenue = subscriptions.filter((s: any) => s.status === 'active').reduce((sum: number, s: any) => sum + (s.amount || 0), 0)
  const pendingPayments = payments.filter((p: any) => p.status === 'pending')
  const activeSubs = subscriptions.filter((s: any) => s.status === 'active')
  const pendingSubs = subscriptions.filter((s: any) => s.status === 'pending')

  const NAV = [
    { key: 'overview', icon: <LayoutDashboard size={20}/>, label: 'Overview' },
    { key: 'subscriptions', icon: <Star size={20}/>, label: 'Subscriptions', badge: pendingSubs.length },
    { key: 'payments', icon: <CreditCard size={20}/>, label: 'Payments', badge: pendingPayments.length },
    { key: 'landlords', icon: <Building2 size={20}/>, label: 'Landlords' },
    { key: 'tenants', icon: <Users size={20}/>, label: 'Tenants' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, flexDirection: 'column', gap: 16 }}>
      <Logo size={48}/><div style={{ color: C.muted, fontSize: 14 }}>Loading admin console...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: '#0F1A14', padding: '16px 20px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo size={34}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: C.purple + '20', border: `1px solid ${C.purple}40`, borderRadius: 8, padding: '5px 12px', color: C.purple, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}><Shield size={12}/> Super Admin</div>
            <button onClick={fetchData} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><RefreshCw size={15}/></button>
          </div>
        </div>
        {tab === 'overview' && (
          <div style={{ marginTop: 14 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Platform Revenue</div>
            <div style={{ color: C.white, fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginTop: 2 }}>{formatUGX(totalRevenue)}</div>
            <div style={{ color: C.ochre, fontSize: 12, fontWeight: 600, marginTop: 2 }}>{activeSubs.length} active subscriptions</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 700, margin: '0 auto', width: '100%' }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <StatCard icon={<Building2 size={18}/>} value={landlords.length} label="Landlords" color={C.forest} trend="+2" />
              <StatCard icon={<Users size={18}/>} value={tenants.length} label="Tenants" color={C.ochre} />
              <StatCard icon={<Activity size={18}/>} value={properties.length} label="Properties" color={C.blue} />
              <StatCard icon={<Star size={18}/>} value={activeSubs.length} label="Active Subs" sub={`${pendingSubs.length} pending`} color={C.purple} />
            </div>

            {/* Pending subscriptions alert */}
            {pendingSubs.length > 0 && (
              <div style={{ background: C.ochre + '10', border: `1px solid ${C.ochre}30`, borderRadius: 16, padding: '16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setTab('subscriptions')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: C.ochre + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ochre }}><Clock size={18}/></div>
                  <div>
                    <div style={{ fontWeight: 700, color: C.charcoal }}>{pendingSubs.length} subscription{pendingSubs.length > 1 ? 's' : ''} awaiting approval</div>
                    <div style={{ fontSize: 13, color: C.muted }}>Review and activate landlord plans</div>
                  </div>
                </div>
                <ChevronRight size={18} color={C.muted}/>
              </div>
            )}

            {/* Pending payments alert */}
            {pendingPayments.length > 0 && (
              <div style={{ background: C.red + '08', border: `1px solid ${C.red}25`, borderRadius: 16, padding: '16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setTab('payments')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: C.red + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.red }}><AlertTriangle size={18}/></div>
                  <div>
                    <div style={{ fontWeight: 700, color: C.charcoal }}>{pendingPayments.length} rent payment{pendingPayments.length > 1 ? 's' : ''} pending</div>
                    <div style={{ fontSize: 13, color: C.muted }}>Confirm after verifying MoMo/bank</div>
                  </div>
                </div>
                <ChevronRight size={18} color={C.muted}/>
              </div>
            )}

            {/* Revenue breakdown */}
            <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 12 }}>Revenue Breakdown</h3>
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
              {[
                { label: 'Monthly subscriptions', value: subscriptions.filter((s: any) => s.plan === 'monthly' && s.status === 'active').reduce((sum: number, s: any) => sum + s.amount, 0), color: C.forest },
                { label: 'Annual subscriptions', value: subscriptions.filter((s: any) => s.plan === 'annual' && s.status === 'active').reduce((sum: number, s: any) => sum + s.amount, 0), color: C.purple },
                { label: 'Pending confirmation', value: subscriptions.filter((s: any) => s.status === 'pending').reduce((sum: number, s: any) => sum + s.amount, 0), color: C.ochre },
              ].map((r, i) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                    <div style={{ fontSize: 14, color: C.body }}>{r.label}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: C.charcoal }}>{formatUGX(r.value)}</div>
                </div>
              ))}
            </div>

            {/* Recent landlords */}
            <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 12 }}>Recent Landlords</h3>
            {landlords.slice(0, 3).map((l: any) => (
              <div key={l.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => { setSelectedLandlord(l); setTab('landlords') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.forest, fontWeight: 800, fontSize: 16 }}>{l.full_name?.[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: C.charcoal }}>{l.full_name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{l.email}</div>
                  </div>
                </div>
                <Badge color={l.is_active ? C.green : C.red}>{l.is_active ? 'Active' : 'Suspended'}</Badge>
              </div>
            ))}
          </div>
        )}

        {/* SUBSCRIPTIONS */}
        {tab === 'subscriptions' && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 6 }}>Subscriptions</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Landlords pay you to use The Ardhi. Activate after confirming payment.</p>

            {/* Pricing reference */}
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 18, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 12, fontSize: 15 }}>Your Pricing</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: C.mint, borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.forest, marginTop: 4 }}>UGX 50,000</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>per property</div>
                </div>
                <div style={{ background: '#F0F1FF', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Annual</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.purple, marginTop: 4 }}>UGX 500,000</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>per property</div>
                </div>
              </div>
            </div>

            {subscriptions.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, color: C.muted }}>No subscriptions yet</div>}
            {subscriptions.map((s: any) => (
              <div key={s.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `3px solid ${s.status === 'active' ? C.green : s.status === 'expired' ? C.red : C.ochre}`, padding: '16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: C.charcoal, fontSize: 15 }}>{s.landlord_name}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11}/>{s.landlord_email}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11}/>{s.landlord_phone}</div>
                  </div>
                  <Badge color={s.status === 'active' ? C.green : s.status === 'expired' ? C.red : C.ochre}>{s.status}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: s.status === 'pending' ? 12 : 0 }}>
                  <div style={{ background: C.canvas, borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                    <span style={{ color: C.muted }}>Plan: </span><span style={{ fontWeight: 700, color: C.charcoal, textTransform: 'capitalize' }}>{s.plan}</span>
                  </div>
                  <div style={{ background: C.canvas, borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                    <span style={{ color: C.muted }}>Amount: </span><span style={{ fontWeight: 700, color: C.charcoal }}>{formatUGX(s.amount)}</span>
                  </div>
                </div>
                {s.status === 'active' && s.end_date && (
                  <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}><Calendar size={11}/> Expires {new Date(s.end_date).toLocaleDateString()}</div>
                )}
                {s.status === 'pending' && (
                  <button onClick={() => activateSubscription(s.id, s.plan)} style={{ width: '100%', padding: '11px', border: 'none', borderRadius: 10, background: C.forest, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <CheckCircle size={16}/> Activate Subscription
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PAYMENTS */}
        {tab === 'payments' && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 6 }}>Rent Payments</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Confirm after verifying on MTN MoMo or bank statement.</p>
            {pendingPayments.length > 0 && (
              <>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: C.red, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={15}/> Pending ({pendingPayments.length})</h3>
                {pendingPayments.map((p: any) => (
                  <div key={p.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.ochre}`, padding: '16px', marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, color: C.charcoal, fontSize: 15 }}>{p.tenant_name}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.property_name}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.payment_method?.replace(/_/g, ' ')} · {p.phone_or_account}</div>
                        <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace', marginTop: 2 }}>Ref: {p.reference}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{new Date(p.created_at).toLocaleString()}</div>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 17, color: C.charcoal }}>{formatUGX(p.amount)}</div>
                    </div>
                    <button onClick={() => confirmPayment(p.id)} style={{ width: '100%', padding: '11px', border: 'none', borderRadius: 10, background: C.green, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <CheckCircle size={16}/> Confirm Payment
                    </button>
                  </div>
                ))}
              </>
            )}
            <h3 style={{ fontWeight: 700, fontSize: 15, color: C.charcoal, margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={15}/> All Payments</h3>
            {payments.map((p: any) => (
              <div key={p.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.charcoal }}>{p.tenant_name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.property_name} · {p.payment_method?.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>{p.reference}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.charcoal }}>{formatUGX(p.amount)}</div>
                  <Badge color={p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre}>{p.status}</Badge>
                </div>
              </div>
            ))}
            {payments.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, color: C.muted }}>No payments yet</div>}
          </div>
        )}

        {/* LANDLORDS */}
        {tab === 'landlords' && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 16 }}>Landlords ({landlords.length})</h2>
            {landlords.map((l: any) => {
              const sub = subscriptions.find((s: any) => s.landlord_id === l.id && s.status === 'active')
              return (
                <div key={l.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 46, height: 46, borderRadius: '50%', background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.forest, fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{l.full_name?.[0]}</div>
                      <div>
                        <div style={{ fontWeight: 800, color: C.charcoal, fontSize: 15 }}>{l.full_name}</div>
                        <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Mail size={11}/>{l.email}</div>
                        <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Phone size={11}/>{l.phone}</div>
                      </div>
                    </div>
                    <Badge color={l.is_active ? C.green : C.red}>{l.is_active ? 'Active' : 'Suspended'}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <div style={{ background: C.canvas, borderRadius: 8, padding: '6px 12px', fontSize: 12, color: C.muted }}>
                      Joined {new Date(l.created_at).toLocaleDateString()}
                    </div>
                    {sub ? (
                      <div style={{ background: C.mint, borderRadius: 8, padding: '6px 12px', fontSize: 12, color: C.green, fontWeight: 600 }}>
                        ✓ Subscribed ({sub.plan})
                      </div>
                    ) : (
                      <div style={{ background: C.red + '10', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: C.red, fontWeight: 600 }}>
                        No subscription
                      </div>
                    )}
                  </div>
                  <button onClick={() => toggleLandlord(l.id, l.is_active)} style={{ width: '100%', padding: '10px', border: `1px solid ${l.is_active ? C.red : C.green}`, borderRadius: 10, background: 'none', color: l.is_active ? C.red : C.green, fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {l.is_active ? <><UserX size={15}/> Suspend Account</> : <><UserCheck size={15}/> Reinstate Account</>}
                  </button>
                </div>
              )
            })}
            {landlords.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, color: C.muted }}>No landlords yet</div>}
          </div>
        )}

        {/* TENANTS */}
        {tab === 'tenants' && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 16 }}>Tenants ({tenants.length})</h2>
            {tenants.map((t: any) => (
              <div key={t.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#FFF8EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.ochre, fontWeight: 800, fontSize: 17 }}>{t.full_name?.[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: C.charcoal }}>{t.full_name}</div>
                      <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11}/>{t.phone}</div>
                      <div style={{ fontSize: 12, color: C.forest, fontWeight: 600, marginTop: 2 }}>{t.property_name} · Unit {t.unit_number}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: C.charcoal }}>{formatUGX(t.rent_amount)}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>/month</div>
                  </div>
                </div>
              </div>
            ))}
            {tenants.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, color: C.muted }}>No tenants yet</div>}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0F1A14', borderTop: `1px solid rgba(255,255,255,0.08)`, display: 'flex', zIndex: 100 }}>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ flex: 1, padding: '10px 4px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: tab === n.key ? C.ochre : 'rgba(255,255,255,0.4)', position: 'relative' }}>
            {(n.badge ?? 0) > 0 && <div style={{ position: 'absolute', top: 6, right: '50%', transform: 'translateX(10px)', background: C.red, color: C.white, borderRadius: 20, minWidth: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.badge}</div>}
            <div style={{ transition: 'transform 0.15s', transform: tab === n.key ? 'scale(1.1)' : 'scale(1)' }}>{n.icon}</div>
            <div style={{ fontSize: 9, fontWeight: tab === n.key ? 700 : 500 }}>{n.label}</div>
            {tab === n.key && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 2, background: C.ochre, borderRadius: '0 0 4px 4px' }} />}
          </button>
        ))}
      </div>

      <Toast msg={toast.msg} visible={toast.show}/>
    </div>
  )
}
