'use client'
import { useState, useEffect, useCallback } from 'react'
import Logo from '@/components/Logo'
import {
  LayoutDashboard, Building2, Users, CreditCard, Bell, FileText,
  Plus, ChevronRight, TrendingUp, AlertTriangle, CheckCircle,
  MapPin, Home, X, Copy, Eye, RefreshCw, Phone, IdCard,
  DoorOpen, Banknote, MoreVertical, ArrowUpRight, List, Wifi,
  Shield, Car, Zap, Droplets, Tv, Wind, Trash2
} from 'lucide-react'

const C = {
  forest: '#1B3A2D', forestLight: '#2A5240', ochre: '#C8922A',
  canvas: '#F9F6F1', charcoal: '#1A1A1A', body: '#3D3D3D',
  mint: '#EBF4EF', red: '#D64045', border: '#E8E4DC',
  muted: '#8A8A82', white: '#FFFFFF', green: '#2A7D4F'
}

const PROP_TYPES = [
  { value: 'apartment', label: 'Apartment / Flat', icon: '🏢' },
  { value: 'residential', label: 'Residential / Bungalow', icon: '🏡' },
  { value: 'commercial', label: 'Commercial / Plaza', icon: '🏬' },
  { value: 'hostel', label: 'Hostel', icon: '🏠' },
  { value: 'mall', label: 'Shopping Mall', icon: '🛍️' },
  { value: 'shop', label: 'Single Shop', icon: '🏪' },
]

function formatUGX(n: number) { return 'UGX ' + (n || 0).toLocaleString('en-UG') }
function generateCode() { return Math.random().toString(36).substring(2, 8).toUpperCase() }

function Stat({ icon, value, label, sub, color }: any) {
  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: C.charcoal, letterSpacing: '-0.5px' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Badge({ children, color }: any) {
  return (
    <span style={{ background: color + '15', color, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em' }}>
      {children}
    </span>
  )
}

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}>
      <div style={{ background: C.white, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ position: 'sticky', top: 0, background: C.white, padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: C.charcoal }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#F5F5F3', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, cursor: 'pointer' }}><X size={16}/></button>
        </div>
        <div style={{ padding: '20px 24px 40px' }}>{children}</div>
      </div>
    </div>
  )
}

function Input({ label, placeholder, value, onChange, type = 'text' }: any) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={(e: any) => onChange(e.target.value)}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const, color: C.charcoal }} />
    </div>
  )
}

function SelectInput({ label, value, onChange, options }: any) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
      <select value={value} onChange={(e: any) => onChange(e.target.value)}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const, color: C.charcoal }}>
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Btn({ children, onClick, variant = 'primary', size = 'md', full = false, style = {} }: any) {
  const styles: any = {
    primary: { background: C.forest, color: C.white },
    secondary: { background: C.mint, color: C.forest, border: `1px solid ${C.forest}20` },
    ochre: { background: C.ochre, color: C.white },
    ghost: { background: 'transparent', color: C.muted, border: `1px solid ${C.border}` },
    danger: { background: C.red, color: C.white },
  }
  const sizes: any = {
    sm: { padding: '7px 14px', fontSize: 13, borderRadius: 8 },
    md: { padding: '11px 20px', fontSize: 14, borderRadius: 10 },
    lg: { padding: '14px 24px', fontSize: 15, borderRadius: 12 },
  }
  return (
    <button onClick={onClick} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, width: full ? '100%' : 'auto', justifyContent: full ? 'center' : 'flex-start', ...styles[variant], ...sizes[size], ...style }}>
      {children}
    </button>
  )
}

function Toast({ msg, visible }: any) {
  if (!visible) return null
  return (
    <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: C.charcoal, color: C.white, padding: '12px 20px', borderRadius: 40, fontWeight: 600, fontSize: 13, zIndex: 2000, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <CheckCircle size={15}/> {msg}
    </div>
  )
}

export default function LandlordDashboard() {
  const [tab, setTab] = useState('dashboard')
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProp, setSelectedProp] = useState<any>(null)
  const [showAddProp, setShowAddProp] = useState(false)
  const [showAddTenant, setShowAddTenant] = useState(false)
  const [showCode, setShowCode] = useState<string | null>(null)
  const [listings, setListings] = useState<any[]>([])
  const [showAddListing, setShowAddListing] = useState(false)
  const [newListing, setNewListing] = useState({ property_id: '', unit_number: '', title: '', description: '', rent_amount: '', deposit_amount: '', property_type: 'apartment', location: '', amenities: [] as string[] })
  const [toast, setToast] = useState({ show: false, msg: '' })
  const [newProp, setNewProp] = useState({ name: '', type: 'apartment', location: '', total_units: '' })
  const [newTenant, setNewTenant] = useState({ full_name: '', national_id: '', phone: '', email: '', unit: '', rent: '' })

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: '' }), 2500) }

  const fetchData = useCallback(async () => {
    try {
      const [pRes, tRes, payRes, aRes, cRes, lRes] = await Promise.all([
        fetch('/api/landlord/properties'), fetch('/api/landlord/tenants'),
        fetch('/api/landlord/payments'), fetch('/api/landlord/alerts'), fetch('/api/landlord/complaints'),
        fetch('/api/landlord/listings'),
      ])
      const [p, t, pay, a, c, l] = await Promise.all([pRes.json(), tRes.json(), payRes.json(), aRes.json(), cRes.json(), lRes.json()])
      setProperties(p.data || []); setTenants(t.data || []); setPayments(pay.data || [])
      setAlerts(a.data || []); setComplaints(c.data || []); setListings(l.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function addProperty() {
    if (!newProp.name || !newProp.location || !newProp.total_units) return
    const code = generateCode()
    const res = await fetch('/api/landlord/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newProp, invite_code: code, total_units: parseInt(newProp.total_units) }) })
    if (res.ok) { showToast('Property added'); setShowAddProp(false); setShowCode(code); fetchData(); setNewProp({ name: '', type: 'apartment', location: '', total_units: '' }) }
  }

  async function addTenant() {
    if (!newTenant.full_name || !newTenant.national_id || !newTenant.phone || !newTenant.unit || !newTenant.rent) return
    const res = await fetch('/api/landlord/tenants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newTenant, property_id: selectedProp?.id, rent_amount: parseInt(newTenant.rent) }) })
    if (res.ok) { showToast('Tenant onboarded'); setShowAddTenant(false); fetchData(); setNewTenant({ full_name: '', national_id: '', phone: '', email: '', unit: '', rent: '' }) }
    else { const d = await res.json(); showToast(d.error || 'Failed') }
  }

  const totalExpected = tenants.reduce((s: number, t: any) => s + (t.rent_amount || 0), 0)
  const totalCollected = payments.filter((p: any) => p.status === 'confirmed').reduce((s: number, p: any) => s + (p.amount || 0), 0)
  const unpaidTenants = tenants.filter((t: any) => !payments.find((p: any) => p.tenant_id === t.tenant_id && p.status === 'confirmed'))
  const unread = alerts.filter((a: any) => !a.read_by?.includes('landlord')).length
  const collectRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0

  const NAV = [
    { key: 'dashboard', icon: <LayoutDashboard size={20}/>, label: 'Home' },
    { key: 'properties', icon: <Building2 size={20}/>, label: 'Properties' },
    { key: 'tenants', icon: <Users size={20}/>, label: 'Tenants' },
    { key: 'payments', icon: <CreditCard size={20}/>, label: 'Payments' },
    { key: 'alerts', icon: <Bell size={20}/>, label: 'Alerts', badge: unread },
    { key: 'listings', icon: <List size={20}/>, label: 'Listings' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, flexDirection: 'column', gap: 16 }}>
      <Logo size={48} />
      <div style={{ color: C.muted, fontSize: 14 }}>Loading your dashboard...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', flexDirection: 'column', fontFamily: 'inherit', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: C.forest, padding: '16px 20px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo size={34} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {unread > 0 && (
              <div style={{ background: C.red, color: C.white, borderRadius: 20, minWidth: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, padding: '0 6px' }}>{unread}</div>
            )}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.ochre, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 15 }}>L</div>
          </div>
        </div>
        {tab === 'dashboard' && (
          <div style={{ marginTop: 16 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Good day, Landlord</div>
            <div style={{ color: C.white, fontSize: 20, fontWeight: 800, marginTop: 2 }}>Here's your overview</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 600, margin: '0 auto', width: '100%' }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            {/* Rent collection card */}
            <div style={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestLight} 100%)`, borderRadius: 20, padding: '20px 20px 20px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4 }}>Rent collected this month</div>
              <div style={{ color: C.white, fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px' }}>{formatUGX(totalCollected)}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>of {formatUGX(totalExpected)} expected</div>
              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.15)', borderRadius: 6, height: 6 }}>
                <div style={{ background: C.ochre, borderRadius: 6, height: 6, width: `${collectRate}%`, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ color: C.ochre, fontSize: 12, fontWeight: 700, marginTop: 6 }}>{collectRate}% collection rate</div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <Stat icon={<Building2 size={18}/>} value={properties.length} label="Properties" color={C.forest} />
              <Stat icon={<Users size={18}/>} value={tenants.length} label="Tenants" color={C.ochre} />
              <Stat icon={<CheckCircle size={18}/>} value={tenants.length - unpaidTenants.length} label="Paid up" sub="this month" color={C.green} />
              <Stat icon={<AlertTriangle size={18}/>} value={unpaidTenants.length} label="In arrears" color={C.red} />
            </div>

            {/* Unpaid tenants */}
            {unpaidTenants.length > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal }}>In Arrears</h3>
                  <Badge color={C.red}>{unpaidTenants.length} unpaid</Badge>
                </div>
                {unpaidTenants.slice(0, 3).map((t: any) => (
                  <div key={t.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.red}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: C.charcoal }}>{t.full_name}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Unit {t.unit_number} · {t.phone}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: C.red, fontSize: 15 }}>{formatUGX(t.rent_amount)}</div>
                  </div>
                ))}
              </>
            )}

            {/* Recent alerts */}
            {alerts.length > 0 && (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, margin: '20px 0 12px' }}>Recent Alerts</h3>
                {alerts.slice(0, 2).map((a: any) => (
                  <div key={a.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, borderLeft: `3px solid ${a.type === 'security' ? C.red : C.ochre}`, padding: '14px 16px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                      <Badge color={a.type === 'security' ? C.red : C.ochre}>{a.type}</Badge>
                      <span style={{ fontSize: 11, color: C.muted }}>{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 14, color: C.body }}>{a.message}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>From {a.sender_name}</div>
                  </div>
                ))}
              </>
            )}

            {/* Quick actions */}
            <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, margin: '20px 0 12px' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setShowAddProp(true)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px', cursor: 'pointer', textAlign: 'left' }}>
                <Plus size={20} color={C.forest} style={{ marginBottom: 8 }} />
                <div style={{ fontWeight: 700, fontSize: 14, color: C.charcoal }}>Add Property</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Register a new building</div>
              </button>
              <button onClick={() => setTab('tenants')} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px', cursor: 'pointer', textAlign: 'left' }}>
                <Users size={20} color={C.ochre} style={{ marginBottom: 8 }} />
                <div style={{ fontWeight: 700, fontSize: 14, color: C.charcoal }}>Onboard Tenant</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Add to a property</div>
              </button>
            </div>
          </div>
        )}

        {/* PROPERTIES */}
        {tab === 'properties' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal }}>Properties</h2>
              <Btn variant="ochre" size="sm" onClick={() => setShowAddProp(true)}><Plus size={15}/> Add</Btn>
            </div>
            {properties.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
                <Building2 size={48} color={C.border} style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>No properties yet</div>
                <div style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Add your first property to get started</div>
                <Btn variant="primary" onClick={() => setShowAddProp(true)}><Plus size={15}/> Add Property</Btn>
              </div>
            )}
            {properties.map((p: any) => (
              <div key={p.id} style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: 18, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 20 }}>{PROP_TYPES.find(t => t.value === p.type)?.icon}</span>
                      <div style={{ fontWeight: 800, fontSize: 16, color: C.charcoal }}>{p.name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.muted, fontSize: 13 }}>
                      <MapPin size={12}/> {p.location}
                    </div>
                  </div>
                  <Badge color={C.forest}>{p.type}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 0, background: '#F9F6F1', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                  {[{ l: 'Units', v: p.total_units, c: C.forest }, { l: 'Occupied', v: p.occupied_units, c: C.ochre }, { l: 'Vacant', v: p.total_units - p.occupied_units, c: C.red }].map((s, i) => (
                    <div key={s.l} style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ fontWeight: 900, fontSize: 20, color: s.c }}>{s.v}</div>
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="secondary" size="sm" onClick={() => { setSelectedProp(p); setTab('tenants') }}><Users size={13}/> Tenants</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => setShowCode(p.invite_code)}><Copy size={13}/> Invite Code</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TENANTS */}
        {tab === 'tenants' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal }}>{selectedProp ? selectedProp.name : 'All Tenants'}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedProp && <Btn variant="ghost" size="sm" onClick={() => setSelectedProp(null)}><X size={13}/></Btn>}
                {selectedProp && <Btn variant="ochre" size="sm" onClick={() => setShowAddTenant(true)}><Plus size={13}/> Onboard</Btn>}
              </div>
            </div>
            {!selectedProp && (
              <div style={{ marginBottom: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {properties.map((p: any) => (
                  <button key={p.id} onClick={() => setSelectedProp(p)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '7px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13, color: C.forest, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {PROP_TYPES.find(t => t.value === p.type)?.icon} {p.name}
                  </button>
                ))}
              </div>
            )}
            {selectedProp && <div style={{ color: C.muted, fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12}/>{selectedProp.location}</div>}
            {(selectedProp ? tenants.filter((t: any) => t.property_id === selectedProp.id) : tenants).map((t: any) => {
              const paid = payments.find((p: any) => p.tenant_id === t.tenant_id && p.status === 'confirmed')
              return (
                <div key={t.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `3px solid ${paid ? C.green : C.red}`, padding: '16px', marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: C.charcoal, marginBottom: 4 }}>{t.full_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.muted, marginBottom: 2 }}><DoorOpen size={12}/> Unit {t.unit_number}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.muted, marginBottom: 2 }}><Phone size={12}/> {t.phone}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.muted }}><IdCard size={12}/> {t.national_id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: 15, color: C.charcoal }}>{formatUGX(t.rent_amount)}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>/month</div>
                      <Badge color={paid ? C.green : C.red}>{paid ? '✓ Paid' : 'Unpaid'}</Badge>
                    </div>
                  </div>
                </div>
              )
            })}
            {tenants.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
                <Users size={48} color={C.border} style={{ margin: '0 auto 12px' }}/>
                <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>No tenants yet</div>
                <div style={{ color: C.muted, fontSize: 14 }}>Select a property and onboard your first tenant</div>
              </div>
            )}
          </div>
        )}

        {/* PAYMENTS */}
        {tab === 'payments' && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 16 }}>Payments</h2>
            <div style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.forestLight})`, borderRadius: 20, padding: 20, marginBottom: 16, color: C.white }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 13, opacity: 0.65 }}>Collected this month</div>
                  <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginTop: 2 }}>{formatUGX(totalCollected)}</div>
                  <div style={{ fontSize: 13, opacity: 0.5, marginTop: 2 }}>of {formatUGX(totalExpected)}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 14px', fontSize: 14, fontWeight: 800, color: C.ochre }}>{collectRate}%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, height: 6 }}>
                <div style={{ background: C.ochre, borderRadius: 6, height: 6, width: `${collectRate}%` }} />
              </div>
            </div>
            {payments.map((p: any) => (
              <div key={p.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.charcoal }}>{p.tenant_name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.payment_method?.replace(/_/g, ' ')} · {new Date(p.created_at).toLocaleDateString()}</div>
                  {p.reference && <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>Ref: {p.reference}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre }}>{formatUGX(p.amount)}</div>
                  <Badge color={p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre}>{p.status}</Badge>
                </div>
              </div>
            ))}
            {payments.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, color: C.muted }}>No payments recorded yet</div>}
          </div>
        )}

        {/* ALERTS */}
        {tab === 'alerts' && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 16 }}>Alerts & Notices</h2>
            {alerts.map((a: any) => (
              <div key={a.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `3px solid ${a.type === 'security' ? C.red : a.type === 'payment' ? C.ochre : C.forest}`, padding: '16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <Badge color={a.type === 'security' ? C.red : a.type === 'payment' ? C.ochre : C.forest}>{a.type}</Badge>
                  <span style={{ fontSize: 11, color: C.muted }}>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 14, color: C.body, lineHeight: 1.5 }}>{a.message}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>From {a.sender_name} · {a.property_name}</div>
              </div>
            ))}
            {alerts.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, color: C.muted }}>No alerts yet</div>}
          </div>
        )}

        {/* LISTINGS */}
        {tab === 'listings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal }}>Property Listings</h2>
              <Btn variant="ochre" size="sm" onClick={() => setShowAddListing(true)}><Plus size={15}/> Add Listing</Btn>
            </div>
            <div style={{ background: C.mint, borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: C.forest, lineHeight: 1.6 }}>
              Listings are public — anyone can browse them before signing up. Share the invite link with interested tenants.
            </div>
            {listings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
                <List size={48} color={C.border} style={{ margin: '0 auto 12px' }}/>
                <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>No listings yet</div>
                <div style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Add a listing to attract tenants publicly</div>
                <Btn variant="primary" onClick={() => setShowAddListing(true)}><Plus size={15}/> Add Listing</Btn>
              </div>
            )}
            {listings.map((l: any) => (
              <div key={l.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 18, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.charcoal }}>{l.title}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12}/>{l.location} · Unit {l.unit_number}</div>
                  </div>
                  <span style={{ background: l.is_available ? C.green + '15' : C.red + '15', color: l.is_available ? C.green : C.red, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>{l.is_available ? 'Available' : 'Taken'}</span>
                </div>
                <div style={{ fontWeight: 900, fontSize: 18, color: C.forest, marginBottom: 8 }}>UGX {(l.rent_amount || 0).toLocaleString()}<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>/month</span></div>
                {l.amenities?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {l.amenities.map((a: string) => (
                      <span key={a} style={{ background: C.canvas, borderRadius: 6, padding: '3px 8px', fontSize: 11, color: C.forest, fontWeight: 600 }}>{a}</span>
                    ))}
                  </div>
                )}
                <div style={{ background: C.canvas, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 2 }}>Invite Link Code</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, color: C.forest, letterSpacing: 2 }}>{l.invite_link}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => { navigator.clipboard?.writeText(l.invite_link); showToast('Link copied!') }}><Copy size={13}/> Copy Code</Btn>
                  <Btn variant="secondary" size="sm" onClick={async () => { await fetch('/api/landlord/listings/' + l.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_available: !l.is_available }) }); fetchData(); }}>{l.is_available ? 'Mark Taken' : 'Mark Available'}</Btn>
                  <Btn variant="danger" size="sm" onClick={async () => { await fetch('/api/landlord/listings/' + l.id, { method: 'DELETE' }); fetchData(); showToast('Listing removed') }}><Trash2 size={13}/></Btn>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ flex: 1, padding: '10px 4px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: tab === n.key ? C.forest : C.muted, position: 'relative' }}>
            {(n.badge ?? 0) > 0 && <div style={{ position: 'absolute', top: 6, right: '50%', transform: 'translateX(10px)', background: C.red, color: C.white, borderRadius: 20, minWidth: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ n.badge }</div>}
            <div style={{ transition: 'transform 0.15s', transform: tab === n.key ? 'scale(1.1)' : 'scale(1)' }}>{n.icon}</div>
            <div style={{ fontSize: 10, fontWeight: tab === n.key ? 700 : 500 }}>{n.label}</div>
            {tab === n.key && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, background: C.forest, borderRadius: '0 0 4px 4px' }} />}
          </button>
        ))}
      </div>

      {/* Modals */}
      <Modal open={showAddProp} onClose={() => setShowAddProp(false)} title="Add Property">
        <Input label="Property Name" placeholder="e.g. Nakasero Heights" value={newProp.name} onChange={(v: string) => setNewProp(p => ({ ...p, name: v }))} />
        <SelectInput label="Property Type" value={newProp.type} onChange={(v: string) => setNewProp(p => ({ ...p, type: v }))} options={PROP_TYPES} />
        <Input label="Location" placeholder="e.g. Kololo, Kampala" value={newProp.location} onChange={(v: string) => setNewProp(p => ({ ...p, location: v }))} />
        <Input label="Number of Units" placeholder="e.g. 12" value={newProp.total_units} onChange={(v: string) => setNewProp(p => ({ ...p, total_units: v }))} type="number" />
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Btn variant="ghost" onClick={() => setShowAddProp(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
          <Btn variant="primary" onClick={addProperty} style={{ flex: 1, justifyContent: 'center' }}>Add Property</Btn>
        </div>
      </Modal>

      <Modal open={showAddTenant} onClose={() => setShowAddTenant(false)} title={`Onboard Tenant — ${selectedProp?.name}`}>
        <div style={{ background: C.mint, borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.forest, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Property Invite Code</div>
            <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900, color: C.forest, letterSpacing: 6, marginTop: 2 }}>{selectedProp?.invite_code}</div>
          </div>
          <button onClick={() => { navigator.clipboard?.writeText(selectedProp?.invite_code || ''); showToast('Code copied!') }} style={{ background: C.forest, border: 'none', borderRadius: 8, padding: '8px 12px', color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700 }}><Copy size={13}/> Copy</button>
        </div>
        <Input label="Full Name" placeholder="e.g. Aisha Namutebi" value={newTenant.full_name} onChange={(v: string) => setNewTenant(t => ({ ...t, full_name: v }))} />
        <Input label="National ID" placeholder="CM9200001234" value={newTenant.national_id} onChange={(v: string) => setNewTenant(t => ({ ...t, national_id: v }))} />
        <Input label="Phone" placeholder="0772 100 001" value={newTenant.phone} onChange={(v: string) => setNewTenant(t => ({ ...t, phone: v }))} type="tel" />
        <Input label="Email (optional)" placeholder="tenant@email.com" value={newTenant.email} onChange={(v: string) => setNewTenant(t => ({ ...t, email: v }))} type="email" />
        <Input label="Unit / Room" placeholder="e.g. A1 or Room 5" value={newTenant.unit} onChange={(v: string) => setNewTenant(t => ({ ...t, unit: v }))} />
        <Input label="Monthly Rent (UGX)" placeholder="e.g. 850000" value={newTenant.rent} onChange={(v: string) => setNewTenant(t => ({ ...t, rent: v }))} type="number" />
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Btn variant="ghost" onClick={() => setShowAddTenant(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
          <Btn variant="primary" onClick={addTenant} style={{ flex: 1, justifyContent: 'center' }}>Onboard</Btn>
        </div>
      </Modal>

      <Modal open={!!showCode && !showAddTenant} onClose={() => setShowCode(null)} title="Tenant Invite Code">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: C.forest }}><Copy size={28}/></div>
          <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 900, letterSpacing: 10, color: C.forest }}>{showCode}</div>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>Share this code with your tenant. They enter it when signing up to join your property.</p>
          <Btn variant="primary" onClick={() => { navigator.clipboard?.writeText(showCode || ''); showToast('Code copied!'); setShowCode(null) }} full style={{ marginTop: 20, justifyContent: 'center' }}><Copy size={16}/> Copy Code</Btn>
        </div>
      </Modal>

      {/* Add Listing Modal */}
      <Modal open={showAddListing} onClose={() => setShowAddListing(false)} title="Add Property Listing">
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Property</label>
          <select value={newListing.property_id} onChange={e => setNewListing(l => ({ ...l, property_id: e.target.value, property_type: properties.find(p => p.id === e.target.value)?.type || 'apartment', location: properties.find(p => p.id === e.target.value)?.location || '' }))}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}>
            <option value="">Select a property...</option>
            {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Input label="Listing Title" placeholder="e.g. Spacious 2BR Apartment in Nakasero" value={newListing.title} onChange={(v: string) => setNewListing(l => ({ ...l, title: v }))} />
        <Input label="Unit Number" placeholder="e.g. A1" value={newListing.unit_number} onChange={(v: string) => setNewListing(l => ({ ...l, unit_number: v }))} />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
          <textarea placeholder="Describe the property..." value={newListing.description} onChange={e => setNewListing(l => ({ ...l, description: e.target.value }))} rows={3}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const, fontFamily: 'inherit', resize: 'none' as const }} />
        </div>
        <Input label="Monthly Rent (UGX)" placeholder="e.g. 850000" value={newListing.rent_amount} onChange={(v: string) => setNewListing(l => ({ ...l, rent_amount: v }))} type="number" />
        <Input label="Deposit Amount (UGX)" placeholder="e.g. 1700000" value={newListing.deposit_amount} onChange={(v: string) => setNewListing(l => ({ ...l, deposit_amount: v }))} type="number" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amenities</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['WiFi', 'Security', 'Parking', 'Generator', 'Water', 'DSTV', 'Air Conditioning', 'Furnished'].map(a => {
              const selected = newListing.amenities.includes(a)
              return (
                <button key={a} onClick={() => setNewListing(l => ({ ...l, amenities: selected ? l.amenities.filter(x => x !== a) : [...l.amenities, a] }))}
                  style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${selected ? C.forest : C.border}`, background: selected ? C.mint : C.white, color: selected ? C.forest : C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {a}
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Btn variant="ghost" onClick={() => setShowAddListing(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
          <Btn variant="ochre" style={{ flex: 1, justifyContent: 'center' }} onClick={async () => {
            if (!newListing.property_id || !newListing.title || !newListing.rent_amount) return
            const res = await fetch('/api/landlord/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newListing, rent_amount: parseInt(newListing.rent_amount), deposit_amount: parseInt(newListing.deposit_amount || '0') }) })
            if (res.ok) { showToast('Listing published'); setShowAddListing(false); fetchData(); setNewListing({ property_id: '', unit_number: '', title: '', description: '', rent_amount: '', deposit_amount: '', property_type: 'apartment', location: '', amenities: [] }) }
          }}>Publish Listing</Btn>
        </div>
      </Modal>

      <Toast msg={toast.msg} visible={toast.show} />
    </div>
  )
}
