'use client'
import { useState, useEffect, useCallback } from 'react'
import Logo from '@/components/Logo'
import {
  LayoutDashboard, Users, Building2, CreditCard, Star,
  CheckCircle, Clock, AlertTriangle, X, ChevronRight, Phone, Mail,
  Calendar, Shield, ArrowUpRight, RefreshCw,
  UserCheck, UserX, Activity, Zap, TrendingUp, Database,
  Cpu, Globe, Lock, BarChart2, Radio, GitBranch, Server
} from 'lucide-react'

const A = {
  bg: '#060D0A', surface: '#0D1F16', card: '#111F17',
  border: 'rgba(255,255,255,0.07)', neon: '#00FF87', neonDim: 'rgba(0,255,135,0.10)',
  ochre: '#C8922A', red: '#FF4560', amber: '#FFB547',
  blue: '#3B82F6', purple: '#8B5CF6',
  muted: 'rgba(255,255,255,0.4)', dim: 'rgba(255,255,255,0.18)',
  white: '#FFFFFF', text: 'rgba(255,255,255,0.85)'
}

function formatUGX(n: number) {
  if (n >= 1000000) return 'UGX ' + (n / 1000000).toFixed(1) + 'M'
  return 'UGX ' + (n || 0).toLocaleString('en-UG')
}
function formatUGXFull(n: number) { return 'UGX ' + (n || 0).toLocaleString('en-UG') }

function Pill({ children, color }: any) {
  return <span style={{ background: color + '1A', color, border: `1px solid ${color}30`, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>{children}</span>
}

function NeonBar({ pct, color = A.neon }: any) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 4, overflow: 'hidden', marginTop: 10 }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 4, boxShadow: `0 0 8px ${color}60`, transition: 'width 0.8s ease' }}/>
    </div>
  )
}

function KPICard({ icon, value, label, sub, color = A.neon, trend, pct }: any) {
  return (
    <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at 100% 0%, ${color}12 0%, transparent 70%)`, borderRadius: '0 16px 0 0' }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color, border: `1px solid ${color}25` }}>{icon}</div>
        {trend && <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: A.neonDim, border: `1px solid ${A.neon}25`, borderRadius: 6, padding: '3px 8px', color: A.neon, fontSize: 11, fontWeight: 700 }}><ArrowUpRight size={10}/>{trend}</div>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: A.white, letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: A.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: A.dim, marginTop: 2 }}>{sub}</div>}
      {pct !== undefined && <NeonBar pct={pct} color={color}/>}
    </div>
  )
}

function SectionHead({ children, action }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: A.neon, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 16, height: 2, background: A.neon, display: 'inline-block', borderRadius: 2 }}/>
        {children}
      </div>
      {action}
    </div>
  )
}

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: A.card, padding: '20px 24px 16px', borderBottom: `1px solid ${A.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 800, fontSize: 17, color: A.white, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.muted, cursor: 'pointer' }}><X size={15}/></button>
        </div>
        <div style={{ padding: '20px 24px 40px' }}>{children}</div>
      </div>
    </div>
  )
}

function Toast({ msg, visible }: any) {
  if (!visible) return null
  return <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: A.neon, color: '#000', padding: '11px 20px', borderRadius: 40, fontWeight: 700, fontSize: 13, zIndex: 2000, whiteSpace: 'nowrap', boxShadow: `0 8px 24px ${A.neon}40`, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={14}/> {msg}</div>
}

function LiveDot() {
  return <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: A.neon, boxShadow: `0 0 6px ${A.neon}`, animation: 'pulse 2s ease-in-out infinite' }}/>
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState<any>({})
  const [landlords, setLandlords] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, msg: '' })
  const [now, setNow] = useState(new Date())

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: '' }), 2500) }

  const fetchData = useCallback(async () => {
    try {
      const [sRes, lRes, tRes, payRes, subRes] = await Promise.all([
        fetch('/api/admin/stats'), fetch('/api/admin/landlords'), fetch('/api/admin/tenants'),
        fetch('/api/admin/payments'), fetch('/api/admin/subscriptions'),
      ])
      const [s, l, t, pay, sub] = await Promise.all([sRes.json(), lRes.json(), tRes.json(), payRes.json(), subRes.json()])
      setStats(s.data || {}); setLandlords(l.data || []); setTenants(t.data || [])
      setPayments(pay.data || []); setSubscriptions(sub.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])

  async function confirmPayment(id: string) {
    await fetch(`/api/admin/payments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) })
    showToast('Payment confirmed'); fetchData()
  }

  async function toggleLandlord(id: string, current: boolean) {
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !current }) })
    showToast(current ? 'Account suspended' : 'Account reinstated'); fetchData()
  }

  async function activateSubscription(id: string, plan: string) {
    await fetch(`/api/admin/subscriptions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active', plan }) })
    showToast('Subscription activated'); fetchData()
  }

  const totalRevenue = subscriptions.filter((s: any) => s.status === 'active').reduce((sum: number, s: any) => sum + (s.amount || 0), 0)
  const pendingPayments = payments.filter((p: any) => p.status === 'pending')
  const activeSubs = subscriptions.filter((s: any) => s.status === 'active')
  const pendingSubs = subscriptions.filter((s: any) => s.status === 'pending')
  const confirmedPayTotal = payments.filter((p: any) => p.status === 'confirmed').reduce((s: number, p: any) => s + p.amount, 0)
  const collectionRate = payments.length > 0 ? Math.round((payments.filter((p: any) => p.status === 'confirmed').length / payments.length) * 100) : 0

  const NAV = [
    { key: 'overview', icon: <LayoutDashboard size={18}/>, label: 'Overview' },
    { key: 'subscriptions', icon: <Star size={18}/>, label: 'Subscriptions', badge: pendingSubs.length },
    { key: 'payments', icon: <CreditCard size={18}/>, label: 'Payments', badge: pendingPayments.length },
    { key: 'landlords', icon: <Building2 size={18}/>, label: 'Landlords' },
    { key: 'tenants', icon: <Users size={18}/>, label: 'Tenants' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: A.bg, flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: `2px solid ${A.neon}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ color: A.neon, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Initialising Console</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: A.bg, display: 'flex', flexDirection: 'column' }} className="admin-scroll">
      {/* Desktop Sidebar */}
      <div className="sidebar admin-sidebar" style={{ display: 'none' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: `1px solid ${A.border}` }}>
          <Logo size={32}/>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <LiveDot/>
            <span style={{ fontSize: 10, color: A.neon, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Online</span>
          </div>
          <div style={{ fontSize: 10, color: A.muted, marginTop: 4, fontFamily: 'monospace' }}>{now.toLocaleTimeString()}</div>
        </div>
        <div style={{ padding: '16px 12px', flex: 1 }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', borderRadius: 10, background: tab === n.key ? A.neonDim : 'transparent', color: tab === n.key ? A.neon : A.muted, cursor: 'pointer', marginBottom: 4, fontWeight: tab === n.key ? 700 : 500, fontSize: 13, textAlign: 'left', position: 'relative', borderLeft: tab === n.key ? `2px solid ${A.neon}` : '2px solid transparent' }}>
              {n.icon}{n.label}
              {(n.badge ?? 0) > 0 && <span style={{ marginLeft: 'auto', background: A.red, color: A.white, borderRadius: 10, minWidth: 18, height: 18, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{n.badge}</span>}
            </button>
          ))}
        </div>
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${A.border}` }}>
          <div style={{ background: A.neonDim, border: `1px solid ${A.neon}25`, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 10, color: A.neon, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Shield size={10}/> Admin Access</div>
            <div style={{ fontSize: 11, color: A.muted }}>Calvin Kalungi</div>
            <div style={{ fontSize: 10, color: A.dim, fontFamily: 'monospace', marginTop: 2 }}>Level 5 · Full Access</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="main-content" style={{ flex: 1, paddingBottom: 80 }}>
        {/* Top bar */}
        <div style={{ background: A.surface, borderBottom: `1px solid ${A.border}`, padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="sidebar" style={{ display: 'none' }}/>
            <Logo size={28}/>
            <div>
              <div style={{ fontSize: 10, color: A.neon, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {NAV.find(n => n.key === tab)?.label}
              </div>
              <div style={{ fontSize: 11, color: A.muted, fontFamily: 'monospace' }}>{now.toLocaleTimeString()}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(pendingSubs.length + pendingPayments.length) > 0 && (
              <div style={{ background: A.red + '20', border: `1px solid ${A.red}40`, borderRadius: 8, padding: '5px 10px', color: A.red, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={11}/>{pendingSubs.length + pendingPayments.length} pending
              </div>
            )}
            <div style={{ background: A.neonDim, border: `1px solid ${A.neon}30`, borderRadius: 8, padding: '5px 10px', color: A.neon, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={10}/> ADMIN</div>
            <button onClick={fetchData} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${A.border}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.muted, cursor: 'pointer' }}><RefreshCw size={14}/></button>
          </div>
        </div>

        <div style={{ padding: '20px 16px', maxWidth: 1100, margin: '0 auto' }}>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="fade-up">
              {/* Revenue hero */}
              <div style={{ background: `linear-gradient(135deg, ${A.surface} 0%, #0A1A10 100%)`, border: `1px solid ${A.border}`, borderRadius: 20, padding: '24px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: `radial-gradient(circle, ${A.neon}08 0%, transparent 70%)` }}/>
                <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, background: `radial-gradient(circle, ${A.ochre}06 0%, transparent 70%)` }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: A.neon, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <LiveDot/> Platform Revenue
                    </div>
                    <div style={{ fontSize: 38, fontWeight: 900, color: A.white, letterSpacing: '-1px', lineHeight: 1 }}>{formatUGX(totalRevenue)}</div>
                    <div style={{ fontSize: 12, color: A.muted, marginTop: 6 }}>from {activeSubs.length} active subscription{activeSubs.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${A.border}`, borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: A.white }}>{collectionRate}%</div>
                      <div style={{ fontSize: 10, color: A.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Collection Rate</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${A.border}`, borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: A.neon }}>{formatUGX(confirmedPayTotal)}</div>
                      <div style={{ fontSize: 10, color: A.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Rent Confirmed</div>
                    </div>
                  </div>
                </div>
                <NeonBar pct={collectionRate}/>
              </div>

              {/* KPI grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }} className="stat-grid">
                <KPICard icon={<Building2 size={16}/>} value={landlords.length} label="Landlords" color={A.neon} pct={Math.min(landlords.length * 10, 100)}/>
                <KPICard icon={<Users size={16}/>} value={tenants.length} label="Tenants" color={A.blue} pct={Math.min(tenants.length * 5, 100)}/>
                <KPICard icon={<Star size={16}/>} value={activeSubs.length} label="Active Subs" sub={`${pendingSubs.length} pending`} color={A.purple} pct={subscriptions.length > 0 ? Math.round((activeSubs.length/subscriptions.length)*100) : 0}/>
                <KPICard icon={<CreditCard size={16}/>} value={pendingPayments.length} label="Pending Payments" color={pendingPayments.length > 0 ? A.amber : A.neon}/>
              </div>

              {/* System metrics strip */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { icon: <Server size={13}/>, label: 'Supabase', value: 'Online', color: A.neon },
                  { icon: <Globe size={13}/>, label: 'Vercel', value: 'Healthy', color: A.neon },
                  { icon: <Database size={13}/>, label: 'PostgreSQL', value: 'Active', color: A.neon },
                ].map(m => (
                  <div key={m.label} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ color: m.color }}>{m.icon}</div>
                    <div>
                      <div style={{ fontSize: 10, color: A.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>{m.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alerts */}
              {pendingSubs.length > 0 && (
                <div onClick={() => setTab('subscriptions')} style={{ background: A.card, border: `1px solid ${A.amber}30`, borderLeft: `3px solid ${A.amber}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: A.amber + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.amber }}><Clock size={16}/></div>
                    <div>
                      <div style={{ fontWeight: 700, color: A.white, fontSize: 14 }}>{pendingSubs.length} subscription{pendingSubs.length > 1 ? 's' : ''} awaiting activation</div>
                      <div style={{ fontSize: 12, color: A.muted }}>Review and activate landlord plans</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color={A.muted}/>
                </div>
              )}
              {pendingPayments.length > 0 && (
                <div onClick={() => setTab('payments')} style={{ background: A.card, border: `1px solid ${A.red}30`, borderLeft: `3px solid ${A.red}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: A.red + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.red }}><AlertTriangle size={16}/></div>
                    <div>
                      <div style={{ fontWeight: 700, color: A.white, fontSize: 14 }}>{pendingPayments.length} payment{pendingPayments.length > 1 ? 's' : ''} require confirmation</div>
                      <div style={{ fontSize: 12, color: A.muted }}>Verify on MoMo / bank before confirming</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color={A.muted}/>
                </div>
              )}

              {/* Revenue breakdown */}
              <div style={{ marginTop: 20, marginBottom: 14 }}>
                <SectionHead>Revenue Breakdown</SectionHead>
                <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, overflow: 'hidden' }}>
                  {[
                    { label: 'Monthly subscriptions', value: subscriptions.filter((s: any) => s.plan === 'monthly' && s.status === 'active').reduce((sum: number, s: any) => sum + s.amount, 0), color: A.neon },
                    { label: 'Annual subscriptions', value: subscriptions.filter((s: any) => s.plan === 'annual' && s.status === 'active').reduce((sum: number, s: any) => sum + s.amount, 0), color: A.purple },
                    { label: 'Pending (unconfirmed)', value: subscriptions.filter((s: any) => s.status === 'pending').reduce((sum: number, s: any) => sum + s.amount, 0), color: A.amber },
                  ].map((r, i) => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: i < 2 ? `1px solid ${A.border}` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, boxShadow: `0 0 6px ${r.color}80` }}/>
                        <div style={{ fontSize: 13, color: A.muted }}>{r.label}</div>
                      </div>
                      <div style={{ fontWeight: 800, color: r.value > 0 ? r.color : A.dim, fontSize: 14 }}>{formatUGXFull(r.value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <SectionHead>Recent Landlords</SectionHead>
              {landlords.slice(0, 4).map((l: any) => {
                const sub = subscriptions.find((s: any) => s.landlord_id === l.id && s.status === 'active')
                return (
                  <div key={l.id} onClick={() => setTab('landlords')} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: A.neonDim, border: `1px solid ${A.neon}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.neon, fontWeight: 800 }}>{l.full_name?.[0]}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: A.white, fontSize: 14 }}>{l.full_name}</div>
                        <div style={{ fontSize: 11, color: A.muted }}>{l.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {sub && <Pill color={A.neon}>Active</Pill>}
                      {!l.is_active && <Pill color={A.red}>Suspended</Pill>}
                      <ChevronRight size={14} color={A.dim}/>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* SUBSCRIPTIONS */}
          {tab === 'subscriptions' && (
            <div className="fade-up">
              <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: A.neon, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Pricing Structure</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[{ label: 'Monthly', price: 'UGX 50,000', color: A.neon }, { label: 'Annual', price: 'UGX 500,000', color: A.purple }].map(p => (
                    <div key={p.label} style={{ background: p.color + '0C', border: `1px solid ${p.color}20`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: p.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: A.white, marginTop: 6 }}>{p.price}</div>
                      <div style={{ fontSize: 10, color: A.muted, marginTop: 2 }}>per property / period</div>
                    </div>
                  ))}
                </div>
              </div>
              <SectionHead>{subscriptions.length} Subscription{subscriptions.length !== 1 ? 's' : ''}</SectionHead>
              {subscriptions.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: A.muted, background: A.card, borderRadius: 16, border: `1px solid ${A.border}` }}>No subscriptions yet</div>}
              {subscriptions.map((s: any) => (
                <div key={s.id} style={{ background: A.card, border: `1px solid ${s.status === 'pending' ? A.amber + '40' : A.border}`, borderLeft: `3px solid ${s.status === 'active' ? A.neon : s.status === 'expired' ? A.red : A.amber}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, color: A.white, fontSize: 15 }}>{s.landlord_name}</div>
                      <div style={{ fontSize: 12, color: A.muted, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11}/>{s.landlord_email}</div>
                      {s.landlord_phone && <div style={{ fontSize: 12, color: A.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11}/>{s.landlord_phone}</div>}
                    </div>
                    <Pill color={s.status === 'active' ? A.neon : s.status === 'expired' ? A.red : A.amber}>{s.status}</Pill>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    {[{ l: 'Plan', v: s.plan }, { l: 'Amount', v: formatUGXFull(s.amount) }].map(x => (
                      <div key={x.l} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${A.border}`, borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
                        <span style={{ color: A.muted }}>{x.l}: </span><span style={{ fontWeight: 700, color: A.white, textTransform: 'capitalize' }}>{x.v}</span>
                      </div>
                    ))}
                    {s.end_date && <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${A.border}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, color: A.muted, display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10}/> Expires {new Date(s.end_date).toLocaleDateString()}</div>}
                  </div>
                  {s.status === 'pending' && (
                    <button onClick={() => activateSubscription(s.id, s.plan)} style={{ width: '100%', padding: '11px', border: 'none', borderRadius: 10, background: A.neon, color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Zap size={15}/> Activate Subscription
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PAYMENTS */}
          {tab === 'payments' && (
            <div className="fade-up">
              {pendingPayments.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <SectionHead><span style={{ color: A.red }}>Pending Confirmation ({pendingPayments.length})</span></SectionHead>
                  {pendingPayments.map((p: any) => (
                    <div key={p.id} style={{ background: A.card, border: `1px solid ${A.red}30`, borderLeft: `3px solid ${A.amber}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 800, color: A.white, fontSize: 15 }}>{p.tenant_name}</div>
                          <div style={{ fontSize: 12, color: A.muted, marginTop: 2 }}>{p.property_name}</div>
                          <div style={{ fontSize: 12, color: A.muted, marginTop: 2 }}>{p.payment_method?.replace(/_/g, ' ')} · {p.phone_or_account}</div>
                          <div style={{ fontSize: 11, color: A.neon, fontFamily: 'monospace', marginTop: 3, background: A.neonDim, borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>Ref: {p.reference}</div>
                          <div style={{ fontSize: 11, color: A.dim, marginTop: 4 }}>{new Date(p.created_at).toLocaleString()}</div>
                        </div>
                        <div style={{ fontWeight: 900, fontSize: 18, color: A.white, textAlign: 'right' }}>{formatUGXFull(p.amount)}</div>
                      </div>
                      <button onClick={() => confirmPayment(p.id)} style={{ width: '100%', padding: '11px', border: 'none', borderRadius: 10, background: A.neon, color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <CheckCircle size={15}/> Confirm Payment
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <SectionHead>All Payments ({payments.length})</SectionHead>
              {payments.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: A.muted, background: A.card, borderRadius: 16, border: `1px solid ${A.border}` }}>No payments yet</div>}
              {payments.map((p: any) => (
                <div key={p.id} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: A.white, fontSize: 14 }}>{p.tenant_name}</div>
                    <div style={{ fontSize: 12, color: A.muted }}>{p.property_name} · {p.payment_method?.replace(/_/g, ' ')}</div>
                    {p.reference && <div style={{ fontSize: 10, color: A.dim, fontFamily: 'monospace', marginTop: 2 }}>{p.reference}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: A.white, fontSize: 14 }}>{formatUGXFull(p.amount)}</div>
                    <Pill color={p.status === 'confirmed' ? A.neon : p.status === 'failed' ? A.red : A.amber}>{p.status}</Pill>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LANDLORDS */}
          {tab === 'landlords' && (
            <div className="fade-up">
              <SectionHead>{landlords.length} Registered Landlord{landlords.length !== 1 ? 's' : ''}</SectionHead>
              {landlords.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: A.muted, background: A.card, borderRadius: 16, border: `1px solid ${A.border}` }}>No landlords yet</div>}
              {landlords.map((l: any) => {
                const sub = subscriptions.find((s: any) => s.landlord_id === l.id && s.status === 'active')
                return (
                  <div key={l.id} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: A.neonDim, border: `1px solid ${A.neon}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.neon, fontWeight: 800, fontSize: 17, flexShrink: 0 }}>{l.full_name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 800, color: A.white, fontSize: 15 }}>{l.full_name}</div>
                          <div style={{ fontSize: 12, color: A.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Mail size={10}/>{l.email}</div>
                          <div style={{ fontSize: 12, color: A.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Phone size={10}/>{l.phone}</div>
                        </div>
                      </div>
                      <Pill color={l.is_active ? A.neon : A.red}>{l.is_active ? 'Active' : 'Suspended'}</Pill>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${A.border}`, borderRadius: 8, padding: '5px 10px', fontSize: 11, color: A.muted }}>Joined {new Date(l.created_at).toLocaleDateString()}</div>
                      {sub ? (
                        <div style={{ background: A.neonDim, border: `1px solid ${A.neon}25`, borderRadius: 8, padding: '5px 10px', fontSize: 11, color: A.neon, fontWeight: 700 }}>✓ {sub.plan} plan</div>
                      ) : (
                        <div style={{ background: A.red + '12', border: `1px solid ${A.red}30`, borderRadius: 8, padding: '5px 10px', fontSize: 11, color: A.red, fontWeight: 700 }}>No subscription</div>
                      )}
                    </div>
                    <button onClick={() => toggleLandlord(l.id, l.is_active)} style={{ width: '100%', padding: '10px', border: `1px solid ${l.is_active ? A.red + '50' : A.neon + '50'}`, borderRadius: 10, background: 'transparent', color: l.is_active ? A.red : A.neon, fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {l.is_active ? <><UserX size={14}/> Suspend Account</> : <><UserCheck size={14}/> Reinstate Account</>}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* TENANTS */}
          {tab === 'tenants' && (
            <div className="fade-up">
              <SectionHead>{tenants.length} Tenant{tenants.length !== 1 ? 's' : ''} Platform-wide</SectionHead>
              {tenants.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: A.muted, background: A.card, borderRadius: 16, border: `1px solid ${A.border}` }}>No tenants yet</div>}
              {tenants.map((t: any) => (
                <div key={t.id} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A1030', border: `1px solid ${A.purple}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: A.purple, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{t.full_name?.[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: A.white, fontSize: 14 }}>{t.full_name}</div>
                      <div style={{ fontSize: 12, color: A.muted, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={10}/>{t.phone}</div>
                      <div style={{ fontSize: 11, color: A.neon, fontWeight: 600, marginTop: 2 }}>{t.property_name} · Unit {t.unit_number}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: A.white, fontSize: 14 }}>{formatUGXFull(t.rent_amount)}</div>
                    <div style={{ fontSize: 10, color: A.muted }}>/month</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: A.surface, borderTop: `1px solid ${A.border}`, display: 'flex', zIndex: 100 }} className="bottom-nav">
        {NAV.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ flex: 1, padding: '10px 2px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: tab === n.key ? A.neon : 'rgba(255,255,255,0.3)', position: 'relative' }}>
            {(n.badge ?? 0) > 0 && <div style={{ position: 'absolute', top: 5, right: '50%', transform: 'translateX(10px)', background: A.red, color: A.white, borderRadius: 20, minWidth: 15, height: 15, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.badge}</div>}
            {n.icon}
            <div style={{ fontSize: 9, fontWeight: tab === n.key ? 700 : 500 }}>{n.label}</div>
            {tab === n.key && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, background: A.neon, borderRadius: '0 0 3px 3px' }}/>}
          </button>
        ))}
      </div>

      <Toast msg={toast.msg} visible={toast.show}/>
    </div>
  )
}
