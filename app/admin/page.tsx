'use client'
import { useState, useEffect, useCallback } from 'react'
import Logo from '@/components/Logo'
import {
  LayoutDashboard, Users, Building2, CreditCard, Star, FileCheck,
  CheckCircle, Clock, AlertTriangle, X, ChevronRight, Phone, Mail,
  Shield, ArrowUpRight, RefreshCw, UserCheck, UserX, Zap,
  TrendingUp, TrendingDown, ExternalLink, MapPin, Calendar,
  MoreHorizontal, Search, Download, Bell
} from 'lucide-react'

/* ── colour tokens (clean white corporate) ───────────────────────────── */
const C = {
  bg:      '#F4F6FA',
  white:   '#FFFFFF',
  sidebar: '#0F1F17',       /* very dark forest */
  accent:  '#1DB87A',       /* fresh green */
  accentL: '#E8FAF3',
  ochre:   '#F5A623',
  red:     '#EF4444',
  blue:    '#3B82F6',
  purple:  '#8B5CF6',
  border:  '#E5E9F0',
  muted:   '#8A94A6',
  body:    '#374151',
  charcoal:'#111827',
  teal:    '#0D9488',
}

function fmt(n: number) { return 'UGX ' + (n||0).toLocaleString('en-UG') }
function fmtShort(n: number) {
  if (n >= 1000000) return 'UGX '+(n/1000000).toFixed(1)+'M'
  if (n >= 1000)    return 'UGX '+(n/1000).toFixed(0)+'K'
  return 'UGX '+n
}

/* ── tiny sparkline SVG ───────────────────────────────────────────────── */
function Spark({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data), min = Math.min(...data)
  const h = 36, w = 80
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  )
}

/* ── horizontal bar ──────────────────────────────────────────────────── */
function Bar({ pct, color }: { pct: number, color: string }) {
  return (
    <div style={{ background: '#F1F5F9', borderRadius: 99, height: 6, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ height: '100%', width: `${Math.min(pct,100)}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }}/>
    </div>
  )
}

/* ── stat card ─────────────────────────────────────────────────────────── */
function KPI({ label, value, sub, color, trend, spark, icon }: any) {
  const up = trend >= 0
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: color+'18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
        {spark && <Spark data={spark} color={color}/>}
      </div>
      <div style={{ marginTop: 14, fontSize: 26, fontWeight: 800, color: C.charcoal, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{label}</div>
      {trend !== undefined && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          {up ? <TrendingUp size={13} color={C.accent}/> : <TrendingDown size={13} color={C.red}/>}
          <span style={{ fontSize: 12, fontWeight: 700, color: up ? C.accent : C.red }}>{Math.abs(trend)}%</span>
          <span style={{ fontSize: 11, color: C.muted }}>from last month</span>
        </div>
      )}
      {sub && !trend && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>{sub}</div>}
    </div>
  )
}

/* ── status pill ───────────────────────────────────────────────────────── */
function Pill({ label, color }: any) {
  return <span style={{ background: color+'18', color, border: `1px solid ${color}28`, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' as const }}>{label}</span>
}

function DocPill({ status }: { status: string }) {
  const m: any = { under_review: [C.ochre,'Under Review'], verified: [C.accent,'Verified'], rejected: [C.red,'Rejected'], none: [C.muted,'No Doc'] }
  const [color, label] = m[status] || m.none
  return <Pill label={label} color={color}/>
}

/* ── modal shell ──────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: C.white, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: C.white, padding: 'calc(18px + env(safe-area-inset-top, 0px)) 22px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: C.charcoal }}>{title}</div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, cursor: 'pointer' }}><X size={15}/></button>
        </div>
        <div style={{ padding: '18px 22px 40px' }}>{children}</div>
      </div>
    </div>
  )
}

function Toast({ msg, visible }: any) {
  if (!visible) return null
  return <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: C.charcoal, color: '#fff', padding: '11px 20px', borderRadius: 40, fontWeight: 700, fontSize: 13, zIndex: 9000, whiteSpace: 'nowrap' as const, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>{msg}</div>
}

/* ── sidebar nav item ─────────────────────────────────────────────────── */
function NavItem({ icon, label, active, badge, onClick }: any) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: active ? 700 : 500, fontSize: 13.5, textAlign: 'left' as const, background: active ? 'rgba(29,184,122,0.15)' : 'transparent', color: active ? C.accent : 'rgba(255,255,255,0.55)', marginBottom: 2, borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent', transition: 'all 0.15s' }}>
      <span style={{ color: active ? C.accent : 'rgba(255,255,255,0.4)' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {(badge ?? 0) > 0 && <span style={{ background: C.red, color: '#fff', borderRadius: 99, minWidth: 18, height: 18, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{badge}</span>}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [landlords, setLandlords] = useState<any[]>([])
  const [tenants,   setTenants]   = useState<any[]>([])
  const [payments,  setPayments]  = useState<any[]>([])
  const [subs,      setSubs]      = useState<any[]>([])
  const [verifs,    setVerifs]    = useState<any>({ properties: [], tenants: [] })
  const [loading,   setLoading]   = useState(true)
  const [toast,     setToast]     = useState({ show: false, msg: '' })
  const [docModal,  setDocModal]  = useState<any>(null)
  const [search,    setSearch]    = useState('')
  const [now,       setNow]       = useState(new Date())

  const showToast = (m: string) => { setToast({ show: true, msg: m }); setTimeout(() => setToast({ show: false, msg: '' }), 2500) }

  const fetchAll = useCallback(async () => {
    try {
      const [lR, tR, pR, sR, vR] = await Promise.all([
        fetch('/api/admin/landlords'), fetch('/api/admin/tenants'),
        fetch('/api/admin/payments'),  fetch('/api/admin/subscriptions'),
        fetch('/api/admin/verifications'),
      ])
      const [l, t, p, s, v] = await Promise.all([lR.json(), tR.json(), pR.json(), sR.json(), vR.json()])
      setLandlords(l.data || []); setTenants(t.data || [])
      setPayments(p.data || []);  setSubs(s.data || [])
      setVerifs(v.data || { properties: [], tenants: [] })
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])

  async function act(url: string, body: any, msg: string) {
    await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    showToast(msg); fetchAll()
  }

  /* derived */
  const revenue      = subs.filter((s:any) => s.status==='active').reduce((a:number,s:any) => a+s.amount, 0)
  const pendPay      = payments.filter((p:any) => p.status==='pending')
  const pendSubs     = subs.filter((s:any) => s.status==='pending')
  const activeSubs   = subs.filter((s:any) => s.status==='active')
  const pendPropDocs = verifs.properties.filter((p:any) => p.ownership_status==='under_review')
  const pendTenIds   = verifs.tenants.filter((t:any) => t.id_status==='under_review')
  const totalPendV   = pendPropDocs.length + pendTenIds.length
  const collRate     = payments.length ? Math.round(payments.filter((p:any)=>p.status==='confirmed').length/payments.length*100) : 0

  /* sparkline mock from real count */
  const spark = (base: number) => Array.from({length:7},(_,i)=>Math.max(0, base - Math.floor(Math.random()*3) + i))

  const NAV = [
    { key:'overview',       icon:<LayoutDashboard size={18}/>, label:'Overview' },
    { key:'verifications',  icon:<FileCheck size={18}/>,      label:'Verifications', badge: totalPendV },
    { key:'subscriptions',  icon:<Star size={18}/>,            label:'Subscriptions', badge: pendSubs.length },
    { key:'payments',       icon:<CreditCard size={18}/>,     label:'Payments',      badge: pendPay.length },
    { key:'landlords',      icon:<Building2 size={18}/>,      label:'Landlords' },
    { key:'tenants',        icon:<Users size={18}/>,           label:'Tenants' },
  ]

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: C.bg, flexDirection:'column', gap:16 }}>
      <div style={{ width:44, height:44, border:`3px solid ${C.accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ color: C.muted, fontSize:13, fontWeight:600 }}>Loading admin console…</div>
    </div>
  )

  /* ── date string ── */
  const dateStr = now.toLocaleDateString('en-UG', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <div className="app-shell admin-shell" style={{ minHeight:'100vh', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      <div className="sidebar" style={{ display:'none', flexDirection:'column', background: C.sidebar, position:'fixed', top:0, bottom:0, left:0, width:240, zIndex:200, padding:'0 0 20px' }}>
        {/* Brand */}
        <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <Logo size={32}/>
          <div style={{ marginTop:8, fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em' }}>Admin Console</div>
          <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background: C.accent, display:'inline-block', boxShadow:`0 0 6px ${C.accent}` }}/>
            <span style={{ fontSize:10, color: C.accent, fontWeight:600, fontFamily:'monospace' }}>{now.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding:'16px 12px', flex:1 }}>
          {NAV.map(({ key: nk, ...rest }) => <NavItem key={nk} {...rest} active={tab===nk} onClick={() => setTab(nk)}/>)}
        </div>

        {/* User */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(29,184,122,0.2)', border:`1px solid ${C.accent}40`, display:'flex', alignItems:'center', justifyContent:'center', color: C.accent, fontWeight:800, fontSize:14 }}>C</div>
            <div>
              <div style={{ color:'#fff', fontWeight:700, fontSize:13 }}>Calvin Kalungi</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:4 }}><Shield size={9}/> Super Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <div className="main-content" style={{ background: C.bg, minHeight:'100vh', paddingBottom:80 }}>

        {/* Top bar */}
        <div style={{ background: C.white, borderBottom:`1px solid ${C.border}`, padding:'calc(0px + env(safe-area-inset-top, 0px)) 28px 0', minHeight:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:20, color: C.charcoal }}>
              {NAV.find(n=>n.key===tab)?.label || 'Overview'}
            </div>
            <div style={{ fontSize:11, color: C.muted, marginTop:1 }}>{dateStr}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Search */}
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#F8FAFC', border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 14px' }}>
              <Search size={14} color={C.muted}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
                style={{ border:'none', background:'none', outline:'none', fontSize:13, color: C.charcoal, width:160 }}/>
            </div>
            {/* Bell */}
            <div style={{ position:'relative' }}>
              <button style={{ background:'#F8FAFC', border:`1px solid ${C.border}`, borderRadius:10, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: C.body }}>
                <Bell size={16}/>
              </button>
              {(totalPendV + pendPay.length + pendSubs.length) > 0 && (
                <span style={{ position:'absolute', top:-4, right:-4, background: C.red, color:'#fff', borderRadius:99, minWidth:16, height:16, fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>
                  {totalPendV + pendPay.length + pendSubs.length}
                </span>
              )}
            </div>
            {/* Refresh */}
            <button onClick={fetchAll} style={{ background:'#F8FAFC', border:`1px solid ${C.border}`, borderRadius:10, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: C.muted }}>
              <RefreshCw size={15}/>
            </button>
          </div>
        </div>

        <div style={{ padding:'28px 28px 40px', maxWidth:1400 }}>

          {/* ── OVERVIEW ─────────────────────────────────────────────── */}
          {tab==='overview' && (
            <div className="fade-up">

              {/* KPI row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }} className="stat-grid">
                <KPI icon={<Building2 size={18}/>} label="Total Landlords" value={landlords.length} color={C.accent} trend={2} spark={spark(landlords.length)}/>
                <KPI icon={<Users size={18}/>}     label="Total Tenants"   value={tenants.length}   color={C.blue}   trend={5} spark={spark(tenants.length)}/>
                <KPI icon={<Star size={18}/>}       label="Active Subscriptions" value={activeSubs.length} color={C.purple} sub={`${pendSubs.length} pending`} spark={spark(activeSubs.length)}/>
                <KPI icon={<CreditCard size={18}/>} label="Platform Revenue" value={fmtShort(revenue)} color={C.teal} trend={8} spark={spark(Math.round(revenue/1000))}/>
              </div>

              {/* Alert banners row */}
              {(totalPendV > 0 || pendSubs.length > 0 || pendPay.length > 0) && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
                  {totalPendV > 0 && (
                    <div onClick={()=>setTab('verifications')} style={{ background: C.white, border:`1px solid ${C.ochre}40`, borderLeft:`4px solid ${C.ochre}`, borderRadius:12, padding:'14px 18px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color: C.charcoal }}>{totalPendV} document{totalPendV!==1?'s':''} to verify</div>
                        <div style={{ fontSize:12, color: C.muted, marginTop:2 }}>{pendPropDocs.length} ownership · {pendTenIds.length} tenant ID</div>
                      </div>
                      <FileCheck size={22} color={C.ochre}/>
                    </div>
                  )}
                  {pendSubs.length > 0 && (
                    <div onClick={()=>setTab('subscriptions')} style={{ background: C.white, border:`1px solid ${C.purple}40`, borderLeft:`4px solid ${C.purple}`, borderRadius:12, padding:'14px 18px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color: C.charcoal }}>{pendSubs.length} subscription{pendSubs.length!==1?'s':''} pending</div>
                        <div style={{ fontSize:12, color: C.muted, marginTop:2 }}>Activate after payment confirmed</div>
                      </div>
                      <Clock size={22} color={C.purple}/>
                    </div>
                  )}
                  {pendPay.length > 0 && (
                    <div onClick={()=>setTab('payments')} style={{ background: C.white, border:`1px solid ${C.red}40`, borderLeft:`4px solid ${C.red}`, borderRadius:12, padding:'14px 18px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color: C.charcoal }}>{pendPay.length} payment{pendPay.length!==1?'s':''} to confirm</div>
                        <div style={{ fontSize:12, color: C.muted, marginTop:2 }}>Verify MoMo / bank then confirm</div>
                      </div>
                      <AlertTriangle size={22} color={C.red}/>
                    </div>
                  )}
                </div>
              )}

              {/* Middle row: Revenue breakdown + Subscription stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:20, marginBottom:24 }}>

                {/* Revenue breakdown */}
                <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:'22px 24px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:16, color: C.charcoal }}>Revenue Breakdown</div>
                      <div style={{ fontSize:12, color: C.muted, marginTop:2 }}>Subscription income by plan</div>
                    </div>
                    <div style={{ fontSize:26, fontWeight:900, color: C.charcoal }}>{fmtShort(revenue)}</div>
                  </div>
                  {[
                    { label:'Monthly subscriptions', value: subs.filter((s:any)=>s.plan==='monthly'&&s.status==='active').reduce((a:number,s:any)=>a+s.amount,0), color: C.accent },
                    { label:'Annual subscriptions',  value: subs.filter((s:any)=>s.plan==='annual' &&s.status==='active').reduce((a:number,s:any)=>a+s.amount,0), color: C.purple },
                    { label:'Pending (unconfirmed)', value: subs.filter((s:any)=>s.status==='pending').reduce((a:number,s:any)=>a+s.amount,0), color: C.ochre },
                  ].map(r => {
                    const pct = revenue > 0 ? Math.round(r.value/revenue*100) : 0
                    return (
                      <div key={r.label} style={{ marginBottom:16 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:10, height:10, borderRadius:'50%', background: r.color }}/>
                            <span style={{ fontSize:13, color: C.body }}>{r.label}</span>
                          </div>
                          <span style={{ fontWeight:700, fontSize:13, color: r.value>0 ? C.charcoal : C.muted }}>{fmt(r.value)}</span>
                        </div>
                        <Bar pct={pct} color={r.color}/>
                      </div>
                    )
                  })}
                </div>

                {/* Platform snapshot */}
                <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
                  <div style={{ fontWeight:800, fontSize:16, color: C.charcoal }}>Platform Snapshot</div>
                  {[
                    { label:'Collection rate',    value:`${collRate}%`,          color: C.accent,  icon:<TrendingUp size={15}/> },
                    { label:'Total rent payments',value:`${payments.length}`,    color: C.blue,    icon:<CreditCard size={15}/> },
                    { label:'Confirmed payments', value:`${payments.filter((p:any)=>p.status==='confirmed').length}`, color: C.teal, icon:<CheckCircle size={15}/> },
                    { label:'Docs verified',      value:`${verifs.properties.filter((p:any)=>p.ownership_status==='verified').length + verifs.tenants.filter((t:any)=>t.id_status==='verified').length}`, color: C.purple, icon:<FileCheck size={15}/> },
                  ].map(m => (
                    <div key={m.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:9, background:m.color+'15', display:'flex', alignItems:'center', justifyContent:'center', color:m.color }}>{m.icon}</div>
                        <span style={{ fontSize:13, color: C.body }}>{m.label}</span>
                      </div>
                      <span style={{ fontWeight:800, color: C.charcoal, fontSize:15 }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent landlords & recent tenants */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:'22px 24px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <div style={{ fontWeight:800, fontSize:15, color: C.charcoal }}>Recent Landlords</div>
                    <button onClick={()=>setTab('landlords')} style={{ fontSize:12, color: C.accent, fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>View all →</button>
                  </div>
                  {landlords.slice(0,5).map((l:any) => {
                    const sub = subs.find((s:any)=>s.landlord_id===l.id&&s.status==='active')
                    return (
                      <div key={l.id} style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:12, marginBottom:12, borderBottom:`1px solid ${C.border}` }}>
                        <div style={{ width:38, height:38, borderRadius:'50%', background:`${C.accent}18`, display:'flex', alignItems:'center', justifyContent:'center', color: C.accent, fontWeight:800, fontSize:16, flexShrink:0 }}>{l.full_name?.[0]}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, color: C.charcoal, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.full_name}</div>
                          <div style={{ fontSize:11, color: C.muted, marginTop:1 }}>{l.email}</div>
                        </div>
                        <Pill label={sub?`✓ ${sub.plan}`:'No sub'} color={sub? C.accent : C.muted}/>
                      </div>
                    )
                  })}
                  {landlords.length===0 && <div style={{ textAlign:'center', color: C.muted, padding:24, fontSize:13 }}>No landlords yet</div>}
                </div>

                <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:'22px 24px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <div style={{ fontWeight:800, fontSize:15, color: C.charcoal }}>Recent Tenants</div>
                    <button onClick={()=>setTab('tenants')} style={{ fontSize:12, color: C.accent, fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>View all →</button>
                  </div>
                  {tenants.slice(0,5).map((t:any) => {
                    const idRec = verifs.tenants.find((v:any)=>v.id===t.id)
                    return (
                      <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, paddingBottom:12, marginBottom:12, borderBottom:`1px solid ${C.border}` }}>
                        <div style={{ width:38, height:38, borderRadius:'50%', background:`${C.blue}18`, display:'flex', alignItems:'center', justifyContent:'center', color: C.blue, fontWeight:800, fontSize:16, flexShrink:0 }}>{t.full_name?.[0]}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, color: C.charcoal, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.full_name}</div>
                          <div style={{ fontSize:11, color: C.accent, marginTop:1, fontWeight:600 }}>{t.property_name} · Unit {t.unit_number}</div>
                        </div>
                        <DocPill status={idRec?.id_status||'none'}/>
                      </div>
                    )
                  })}
                  {tenants.length===0 && <div style={{ textAlign:'center', color: C.muted, padding:24, fontSize:13 }}>No tenants yet</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── VERIFICATIONS ──────────────────────────────────────── */}
          {tab==='verifications' && (
            <div className="fade-up">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>

                {/* Property docs */}
                <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden' }}>
                  <div style={{ padding:'18px 22px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15, color: C.charcoal }}>Property Ownership Docs</div>
                      <div style={{ fontSize:12, color: C.muted, marginTop:2 }}>{verifs.properties.length} total · {pendPropDocs.length} pending</div>
                    </div>
                    <FileCheck size={18} color={C.ochre}/>
                  </div>
                  <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:10 }}>
                    {verifs.properties.length===0 && <div style={{ textAlign:'center', color: C.muted, padding:'32px 0', fontSize:13 }}>No documents uploaded yet</div>}
                    {verifs.properties.map((p:any) => (
                      <div key={p.id} style={{ border:`1px solid ${p.ownership_status==='under_review'?C.ochre+'50':C.border}`, borderRadius:12, padding:'14px 16px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:700, color: C.charcoal, fontSize:14 }}>{p.name}</div>
                            <div style={{ fontSize:11, color: C.muted, marginTop:2 }}>{p.profiles?.full_name} · {p.location}</div>
                          </div>
                          <DocPill status={p.ownership_status||'none'}/>
                        </div>
                        {p.ownership_doc_url && (
                          <button onClick={()=>setDocModal({url:p.ownership_doc_url,label:`${p.name} — Ownership Doc`})}
                            style={{ display:'flex', alignItems:'center', gap:5, background:`${C.accent}10`, border:`1px solid ${C.accent}25`, borderRadius:8, padding:'6px 12px', color: C.accent, fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
                            <ExternalLink size={12}/> View Document
                          </button>
                        )}
                        {p.ownership_status==='under_review' && (
                          <div style={{ display:'flex', gap:8 }}>
                            <button onClick={()=>act(`/api/admin/verifications/property/${p.id}`,{status:'verified'},'Property ownership verified ✓')}
                              style={{ flex:1, padding:'9px', border:'none', borderRadius:9, background: C.accent, color:'#fff', fontWeight:800, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                              <CheckCircle size={14}/> Approve
                            </button>
                            <button onClick={()=>act(`/api/admin/verifications/property/${p.id}`,{status:'rejected'},'Document rejected')}
                              style={{ flex:1, padding:'9px', border:`1px solid ${C.red}40`, borderRadius:9, background:'none', color: C.red, fontWeight:700, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                              <X size={14}/> Reject
                            </button>
                          </div>
                        )}
                        {p.ownership_status==='verified' && <div style={{ background:`${C.accent}10`, border:`1px solid ${C.accent}25`, borderRadius:8, padding:'8px 12px', color: C.accent, fontWeight:700, fontSize:12 }}>✓ Ownership verified</div>}
                        {p.ownership_status==='rejected' && <div style={{ background:`${C.red}08`, border:`1px solid ${C.red}25`, borderRadius:8, padding:'8px 12px', color: C.red, fontWeight:700, fontSize:12 }}>✗ Rejected — landlord must re-upload</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tenant IDs */}
                <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden' }}>
                  <div style={{ padding:'18px 22px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15, color: C.charcoal }}>Tenant National IDs</div>
                      <div style={{ fontSize:12, color: C.muted, marginTop:2 }}>{verifs.tenants.length} total · {pendTenIds.length} pending</div>
                    </div>
                    <Users size={18} color={C.blue}/>
                  </div>
                  <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:10 }}>
                    {verifs.tenants.length===0 && <div style={{ textAlign:'center', color: C.muted, padding:'32px 0', fontSize:13 }}>No ID documents uploaded yet</div>}
                    {verifs.tenants.map((t:any) => (
                      <div key={t.id} style={{ border:`1px solid ${t.id_status==='under_review'?C.ochre+'50':C.border}`, borderRadius:12, padding:'14px 16px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:700, color: C.charcoal, fontSize:14 }}>{t.full_name}</div>
                            <div style={{ fontSize:11, color: C.muted, marginTop:2 }}>{t.email} {t.phone && `· ${t.phone}`}</div>
                          </div>
                          <DocPill status={t.id_status||'none'}/>
                        </div>
                        {t.id_doc_url && (
                          <button onClick={()=>setDocModal({url:t.id_doc_url,label:`${t.full_name} — National ID`})}
                            style={{ display:'flex', alignItems:'center', gap:5, background:`${C.blue}10`, border:`1px solid ${C.blue}25`, borderRadius:8, padding:'6px 12px', color: C.blue, fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
                            <ExternalLink size={12}/> View National ID
                          </button>
                        )}
                        {t.id_status==='under_review' && (
                          <div style={{ display:'flex', gap:8 }}>
                            <button onClick={()=>act(`/api/admin/verifications/tenant/${t.id}`,{status:'verified'},'Tenant ID verified ✓')}
                              style={{ flex:1, padding:'9px', border:'none', borderRadius:9, background: C.accent, color:'#fff', fontWeight:800, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                              <CheckCircle size={14}/> Approve ID
                            </button>
                            <button onClick={()=>act(`/api/admin/verifications/tenant/${t.id}`,{status:'rejected'},'ID rejected')}
                              style={{ flex:1, padding:'9px', border:`1px solid ${C.red}40`, borderRadius:9, background:'none', color: C.red, fontWeight:700, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                              <X size={14}/> Reject
                            </button>
                          </div>
                        )}
                        {t.id_status==='verified' && <div style={{ background:`${C.accent}10`, border:`1px solid ${C.accent}25`, borderRadius:8, padding:'8px 12px', color: C.accent, fontWeight:700, fontSize:12 }}>✓ Identity verified</div>}
                        {t.id_status==='rejected' && <div style={{ background:`${C.red}08`, border:`1px solid ${C.red}25`, borderRadius:8, padding:'8px 12px', color: C.red, fontWeight:700, fontSize:12 }}>✗ Rejected — tenant must re-upload</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SUBSCRIPTIONS ──────────────────────────────────────── */}
          {tab==='subscriptions' && (
            <div className="fade-up">
              <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:20, alignItems:'start' }}>
                <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:'22px 24px' }}>
                  <div style={{ fontWeight:800, fontSize:15, color: C.charcoal, marginBottom:16 }}>Pricing</div>
                  {[{label:'Monthly',price:'UGX 55,000',color:C.accent},{label:'Annual',price:'UGX 600,000',color:C.purple}].map(p=>(
                    <div key={p.label} style={{ background:`${p.color}08`, border:`1px solid ${p.color}20`, borderRadius:12, padding:'16px', marginBottom:10, textAlign:'center' }}>
                      <div style={{ fontSize:11, color:p.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>{p.label}</div>
                      <div style={{ fontSize:22, fontWeight:900, color: C.charcoal, marginTop:6 }}>{p.price}</div>
                      <div style={{ fontSize:11, color: C.muted, marginTop:2 }}>per property / period</div>
                    </div>
                  ))}
                  <div style={{ marginTop:16, padding:'14px', background:`${C.accent}08`, borderRadius:12, textAlign:'center' }}>
                    <div style={{ fontSize:24, fontWeight:900, color: C.charcoal }}>{activeSubs.length}</div>
                    <div style={{ fontSize:12, color: C.muted }}>Active subscriptions</div>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {subs.length===0 && <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:40, textAlign:'center', color: C.muted }}>No subscriptions yet</div>}
                  {subs.map((s:any) => (
                    <div key={s.id} style={{ background: C.white, border:`1px solid ${s.status==='pending'?C.ochre+'40':C.border}`, borderLeft:`4px solid ${s.status==='active'?C.accent:s.status==='expired'?C.red:C.ochre}`, borderRadius:14, padding:'16px 18px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                        <div>
                          <div style={{ fontWeight:800, fontSize:15, color: C.charcoal }}>{s.landlord_name}</div>
                          <div style={{ fontSize:12, color: C.muted, marginTop:3, display:'flex', alignItems:'center', gap:4 }}><Mail size={11}/>{s.landlord_email}</div>
                          {s.landlord_phone && <div style={{ fontSize:12, color: C.muted, marginTop:2 }}><Phone size={11} style={{display:'inline',marginRight:4}}/>{s.landlord_phone}</div>}
                        </div>
                        <Pill label={s.status} color={s.status==='active'?C.accent:s.status==='expired'?C.red:s.status==='trial'?C.blue:C.ochre}/>
                      </div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' as const, marginBottom:s.status==='pending'?12:0 }}>
                        {[{l:'Plan',v:s.plan},{l:'Amount',v:fmt(s.amount)}].map(x=>(
                          <div key={x.l} style={{ background:'#F8FAFC', border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 12px', fontSize:12 }}>
                            <span style={{ color: C.muted }}>{x.l}: </span><span style={{ fontWeight:700, color: C.charcoal, textTransform:'capitalize' as const }}>{x.v}</span>
                          </div>
                        ))}
                        {s.end_date && <div style={{ background:'#F8FAFC', border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 12px', fontSize:12, color: C.muted, display:'flex', alignItems:'center', gap:4 }}><Calendar size={10}/> Expires {new Date(s.end_date).toLocaleDateString()}</div>}
                      </div>
                      {(s.status==='pending' || s.status==='expired') && (
                        <button onClick={()=>act(`/api/admin/subscriptions/${s.id}`,{status:'active',plan:s.plan},'Subscription activated')}
                          style={{ width:'100%', padding:'10px', border:'none', borderRadius:10, background: C.accent, color:'#fff', fontWeight:800, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                          <Zap size={14}/> Activate Subscription
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PAYMENTS ─────────────────────────────────────────────── */}
          {tab==='payments' && (
            <div className="fade-up">
              {pendPay.length>0 && (
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontWeight:700, fontSize:14, color: C.red, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}><AlertTriangle size={15}/> Pending ({pendPay.length})</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {pendPay.map((p:any) => (
                      <div key={p.id} style={{ background: C.white, border:`1px solid ${C.ochre}40`, borderLeft:`4px solid ${C.ochre}`, borderRadius:14, padding:'16px 18px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                          <div>
                            <div style={{ fontWeight:800, fontSize:15, color: C.charcoal }}>{p.tenant_name}</div>
                            <div style={{ fontSize:12, color: C.muted, marginTop:2 }}>{p.property_name}</div>
                            <div style={{ fontSize:12, color: C.muted }}>{p.payment_method?.replace(/_/g,' ')} · {p.phone_or_account}</div>
                            <div style={{ fontSize:11, background:`${C.accent}10`, border:`1px solid ${C.accent}25`, borderRadius:6, padding:'2px 8px', display:'inline-block', marginTop:4, fontFamily:'monospace', color: C.teal, fontWeight:700 }}>Ref: {p.reference}</div>
                          </div>
                          <div style={{ fontWeight:900, fontSize:18, color: C.charcoal }}>{fmt(p.amount)}</div>
                        </div>
                        <button onClick={()=>act(`/api/admin/payments/${p.id}`,{status:'confirmed'},'Payment confirmed')}
                          style={{ width:'100%', padding:'10px', border:'none', borderRadius:10, background: C.accent, color:'#fff', fontWeight:800, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                          <CheckCircle size={14}/> Confirm Payment
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ fontWeight:700, fontSize:14, color: C.charcoal, marginBottom:12 }}>All Payments ({payments.length})</div>
              <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden' }}>
                {payments.length===0 && <div style={{ padding:40, textAlign:'center', color: C.muted }}>No payments yet</div>}
                {payments.map((p:any, i:number) => (
                  <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderBottom: i<payments.length-1?`1px solid ${C.border}`:'none' }}>
                    <div>
                      <div style={{ fontWeight:700, color: C.charcoal, fontSize:14 }}>{p.tenant_name}</div>
                      <div style={{ fontSize:12, color: C.muted }}>{p.property_name} · {p.payment_method?.replace(/_/g,' ')}</div>
                      {p.reference && <div style={{ fontSize:10, color: C.muted, fontFamily:'monospace' }}>{p.reference}</div>}
                    </div>
                    <div style={{ textAlign:'right' as const }}>
                      <div style={{ fontWeight:800, color: C.charcoal, fontSize:14 }}>{fmt(p.amount)}</div>
                      <Pill label={p.status} color={p.status==='confirmed'?C.accent:p.status==='failed'?C.red:C.ochre}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LANDLORDS ─────────────────────────────────────────────── */}
          {tab==='landlords' && (
            <div className="fade-up">
              <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden' }}>
                <div style={{ padding:'18px 22px', borderBottom:`1px solid ${C.border}`, fontWeight:800, fontSize:15, color: C.charcoal }}>
                  {landlords.length} Landlord{landlords.length!==1?'s':''}
                </div>
                {landlords.length===0 && <div style={{ padding:40, textAlign:'center', color: C.muted }}>No landlords yet</div>}
                {landlords.map((l:any, i:number) => {
                  const sub = subs.find((s:any)=>s.landlord_id===l.id&&s.status==='active')
                  const propDocs = verifs.properties.filter((p:any)=>p.landlord_id===l.id)
                  const pendD = propDocs.filter((p:any)=>p.ownership_status==='under_review').length
                  const verD  = propDocs.filter((p:any)=>p.ownership_status==='verified').length
                  return (
                    <div key={l.id} style={{ padding:'16px 22px', borderBottom: i<landlords.length-1?`1px solid ${C.border}`:'none', display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:`${C.accent}15`, display:'flex', alignItems:'center', justifyContent:'center', color: C.accent, fontWeight:800, fontSize:18, flexShrink:0 }}>{l.full_name?.[0]}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, color: C.charcoal, fontSize:15 }}>{l.full_name}</div>
                        <div style={{ fontSize:12, color: C.muted, marginTop:2 }}>{l.email} · {l.phone}</div>
                        <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' as const }}>
                          <Pill label={l.is_active?'Active':'Suspended'} color={l.is_active?C.accent:C.red}/>
                          {sub && <Pill label={`✓ ${sub.plan}`} color={C.accent}/>}
                          {!sub && <Pill label="No sub" color={C.muted}/>}
                          {verD>0 && <Pill label={`${verD} doc${verD!==1?'s':''} verified`} color={C.teal}/>}
                          {pendD>0 && <Pill label={`${pendD} under review`} color={C.ochre}/>}
                        </div>
                      </div>
                      <button onClick={()=>act(`/api/admin/users/${l.id}`,{is_active:!l.is_active},l.is_active?'Account suspended':'Account reinstated')}
                        style={{ padding:'8px 16px', border:`1px solid ${l.is_active?C.red+'50':C.accent+'50'}`, borderRadius:9, background:'none', color:l.is_active?C.red:C.accent, fontWeight:700, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
                        {l.is_active?<><UserX size={13}/> Suspend</>:<><UserCheck size={13}/> Reinstate</>}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── TENANTS ───────────────────────────────────────────────── */}
          {tab==='tenants' && (
            <div className="fade-up">
              <div style={{ background: C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden' }}>
                <div style={{ padding:'18px 22px', borderBottom:`1px solid ${C.border}`, fontWeight:800, fontSize:15, color: C.charcoal }}>
                  {tenants.length} Tenant{tenants.length!==1?'s':''} platform-wide
                </div>
                {tenants.length===0 && <div style={{ padding:40, textAlign:'center', color: C.muted }}>No tenants yet</div>}
                {tenants.map((t:any, i:number) => {
                  const idRec = verifs.tenants.find((v:any)=>v.id===t.id)
                  return (
                    <div key={t.id} style={{ padding:'14px 22px', borderBottom: i<tenants.length-1?`1px solid ${C.border}`:'none', display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:`${C.blue}15`, display:'flex', alignItems:'center', justifyContent:'center', color: C.blue, fontWeight:800, fontSize:16, flexShrink:0 }}>{t.full_name?.[0]}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, color: C.charcoal, fontSize:14 }}>{t.full_name}</div>
                        <div style={{ fontSize:12, color: C.muted }}>{t.phone}</div>
                        <div style={{ fontSize:12, color: C.accent, fontWeight:600, marginTop:2 }}>{t.property_name} · Unit {t.unit_number}</div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column' as const, alignItems:'flex-end', gap:6 }}>
                        <div style={{ fontWeight:800, color: C.charcoal, fontSize:14 }}>{fmt(t.rent_amount)}</div>
                        <DocPill status={idRec?.id_status||'none'}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── DOC VIEWER MODAL ──────────────────────────────────────── */}
      {docModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background: C.white, borderRadius:16, width:'100%', maxWidth:700, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontWeight:700, color: C.charcoal }}>{docModal.label}</div>
              <button onClick={()=>setDocModal(null)} style={{ background:'#F1F5F9', border:'none', borderRadius:8, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', color: C.muted, cursor:'pointer' }}><X size={15}/></button>
            </div>
            <div style={{ flex:1, overflow:'auto', padding:20, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {docModal.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={docModal.url} alt="Document" style={{ maxWidth:'100%', maxHeight:'100%', borderRadius:8 }}/>
              ) : docModal.url.includes('BASE64') ? (
                <div style={{ textAlign:'center', color: C.muted, fontSize:13 }}>Document stored (storage bucket not configured). <a href={docModal.url} style={{ color: C.accent }}>View raw</a></div>
              ) : (
                <iframe src={docModal.url} style={{ width:'100%', height:500, border:'none', borderRadius:8 }} title="Doc"/>
              )}
            </div>
            <div style={{ padding:'12px 20px', borderTop:`1px solid ${C.border}` }}>
              <a href={docModal.url} target="_blank" rel="noreferrer" style={{ color: C.accent, fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}><ExternalLink size={13}/> Open in new tab</a>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="bottom-nav" style={{ position:'fixed', bottom:0, left:0, right:0, background: C.sidebar, borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', zIndex:100, paddingBottom:'env(safe-area-inset-bottom, 0px)' }}>
        {NAV.map(({ key: nk, ...nrest }) => (
          <button key={nk} onClick={()=>setTab(nk)} style={{ flex:1, padding:'10px 2px', border:'none', background:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, color:tab===nk?C.accent:'rgba(255,255,255,0.35)', position:'relative' }}>
            {(nrest.badge??0)>0 && <div style={{ position:'absolute', top:5, right:'50%', transform:'translateX(10px)', background:C.red, color:'#fff', borderRadius:20, minWidth:15, height:15, fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{nrest.badge}</div>}
            {nrest.icon}
            <div style={{ fontSize:9, fontWeight:tab===nk?700:400 }}>{nrest.label}</div>
            {tab===nk && <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:20, height:2, background:C.accent, borderRadius:'0 0 3px 3px' }}/>}
          </button>
        ))}
      </div>

      <Toast msg={toast.msg} visible={toast.show}/>
    </div>
  )
}
