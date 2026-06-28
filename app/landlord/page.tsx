'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { getSession, clearSession } from '@/lib/session'
import {
  LayoutDashboard, Building2, Users, CreditCard, Bell, List,
  Plus, ChevronRight, AlertTriangle, CheckCircle, MapPin, X,
  Copy, RefreshCw, Phone, IdCard, DoorOpen, Trash2,
  LogOut, Upload, Image as ImageIcon, Wifi, Shield, Car,
  Zap, Droplets, Tv, Wind, Waves, Dumbbell, Trees,
  Coffee, Utensils, Flame, Sun, Lock, Dog, Star
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

const AMENITIES = [
  { key: 'WiFi', icon: <Wifi size={14}/> },
  { key: 'Security Guard', icon: <Shield size={14}/> },
  { key: 'CCTV', icon: <Lock size={14}/> },
  { key: 'Parking', icon: <Car size={14}/> },
  { key: 'Generator', icon: <Zap size={14}/> },
  { key: 'Borehole Water', icon: <Droplets size={14}/> },
  { key: 'Piped Water', icon: <Droplets size={14}/> },
  { key: 'DSTV', icon: <Tv size={14}/> },
  { key: 'Air Conditioning', icon: <Wind size={14}/> },
  { key: 'Swimming Pool', icon: <Waves size={14}/> },
  { key: 'Gym', icon: <Dumbbell size={14}/> },
  { key: 'Garden', icon: <Trees size={14}/> },
  { key: 'Furnished', icon: <Star size={14}/> },
  { key: 'Kitchen', icon: <Utensils size={14}/> },
  { key: 'Backup Water Tank', icon: <Droplets size={14}/> },
  { key: 'Solar Power', icon: <Sun size={14}/> },
  { key: 'Balcony', icon: <Coffee size={14}/> },
  { key: 'Gas Cooking', icon: <Flame size={14}/> },
  { key: 'Pet Friendly', icon: <Dog size={14}/> },
  { key: 'Elevator', icon: <Building2 size={14}/> },
]

function formatUGX(n: number) { return 'UGX ' + (n || 0).toLocaleString('en-UG') }
function generateCode() { return Math.random().toString(36).substring(2, 8).toUpperCase() }

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: C.white, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: C.white, padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: C.charcoal, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#F5F5F3', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, cursor: 'pointer' }}><X size={16}/></button>
        </div>
        <div style={{ padding: '20px 24px 48px' }}>{children}</div>
      </div>
    </div>
  )
}

function Input({ label, placeholder, value, onChange, type = 'text' }: any) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={(e: any) => onChange(e.target.value)}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const, color: C.charcoal }} />
    </div>
  )
}

function Badge({ children, color }: any) {
  return <span style={{ background: color + '15', color, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{children}</span>
}

function Toast({ msg, visible }: any) {
  if (!visible) return null
  return <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: C.charcoal, color: C.white, padding: '12px 20px', borderRadius: 40, fontWeight: 600, fontSize: 13, zIndex: 2000, whiteSpace: 'nowrap' as const, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={15}/> {msg}</div>
}

function Btn({ children, onClick, variant = 'primary', size = 'md', full = false, disabled = false }: any) {
  const styles: any = {
    primary: { background: disabled ? C.muted : C.forest, color: C.white },
    secondary: { background: C.mint, color: C.forest },
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
    <button onClick={onClick} disabled={disabled} style={{ border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, width: full ? '100%' : 'auto', justifyContent: full ? 'center' : 'flex-start', opacity: disabled ? 0.6 : 1, ...styles[variant], ...sizes[size] }}>
      {children}
    </button>
  )
}

export default function LandlordDashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState('dashboard')
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProp, setSelectedProp] = useState<any>(null)
  const [showAddProp, setShowAddProp] = useState(false)
  const [showAddTenant, setShowAddTenant] = useState(false)
  const [showAddListing, setShowAddListing] = useState(false)
  const [showCode, setShowCode] = useState<string | null>(null)
  const [toast, setToast] = useState({ show: false, msg: '' })
  const [saving, setSaving] = useState(false)

  const [newProp, setNewProp] = useState({ name: '', type: 'apartment', location: '', total_units: '' })
  const [newTenant, setNewTenant] = useState({ full_name: '', national_id: '', phone: '', email: '', unit: '', rent: '' })
  const [newListing, setNewListing] = useState({ property_id: '', unit_number: '', title: '', description: '', rent_amount: '', deposit_amount: '', property_type: 'apartment', location: '', amenities: [] as string[], images: [] as string[] })

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: '' }), 2500) }

  useEffect(() => {
    const session = getSession()
    if (!session) { router.push('/'); return }
    setUserId(session.id)
  }, [router])

  const apiFetch = useCallback((url: string, opts: RequestInit = {}) => {
    return fetch(url, {
      ...opts,
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '', ...(opts.headers || {}) }
    })
  }, [userId])

  const fetchData = useCallback(async () => {
    if (!userId) return
    try {
      const [pRes, tRes, payRes, aRes, cRes, lRes] = await Promise.all([
        apiFetch('/api/landlord/properties'),
        apiFetch('/api/landlord/tenants'),
        apiFetch('/api/landlord/payments'),
        apiFetch('/api/landlord/alerts'),
        apiFetch('/api/landlord/complaints'),
        apiFetch('/api/landlord/listings'),
      ])
      const [p, t, pay, a, c, l] = await Promise.all([pRes.json(), tRes.json(), payRes.json(), aRes.json(), cRes.json(), lRes.json()])
      setProperties(p.data || [])
      setTenants(t.data || [])
      setPayments(pay.data || [])
      setAlerts(a.data || [])
      setComplaints(c.data || [])
      setListings(l.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [userId, apiFetch])

  useEffect(() => { if (userId) fetchData() }, [userId, fetchData])

  function signOut() { clearSession(); router.push('/') }

  async function addProperty() {
    if (!newProp.name || !newProp.location || !newProp.total_units) { showToast('Please fill all fields'); return }
    setSaving(true)
    try {
      const code = generateCode()
      const res = await apiFetch('/api/landlord/properties', {
        method: 'POST',
        body: JSON.stringify({ ...newProp, invite_code: code, total_units: parseInt(newProp.total_units), landlord_id: userId })
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed'); return }
      showToast('Property added')
      setShowAddProp(false)
      setShowCode(code)
      fetchData()
      setNewProp({ name: '', type: 'apartment', location: '', total_units: '' })
    } finally { setSaving(false) }
  }

  async function addTenant() {
    if (!newTenant.full_name || !newTenant.national_id || !newTenant.phone || !newTenant.unit || !newTenant.rent) { showToast('Please fill all fields'); return }
    setSaving(true)
    try {
      const res = await apiFetch('/api/landlord/tenants', {
        method: 'POST',
        body: JSON.stringify({ ...newTenant, property_id: selectedProp?.id, rent_amount: parseInt(newTenant.rent), landlord_id: userId })
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed'); return }
      showToast('Tenant onboarded')
      setShowAddTenant(false)
      fetchData()
      setNewTenant({ full_name: '', national_id: '', phone: '', email: '', unit: '', rent: '' })
    } finally { setSaving(false) }
  }

  async function addListing() {
    if (!newListing.property_id || !newListing.title || !newListing.rent_amount) { showToast('Please fill required fields'); return }
    setSaving(true)
    try {
      const res = await apiFetch('/api/landlord/listings', {
        method: 'POST',
        body: JSON.stringify({ ...newListing, rent_amount: parseInt(newListing.rent_amount), deposit_amount: parseInt(newListing.deposit_amount || '0'), landlord_id: userId })
      })
      if (res.ok) {
        showToast('Listing published')
        setShowAddListing(false)
        fetchData()
        setNewListing({ property_id: '', unit_number: '', title: '', description: '', rent_amount: '', deposit_amount: '', property_type: 'apartment', location: '', amenities: [], images: [] })
      }
    } finally { setSaving(false) }
  }

  function handleImageUpload(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setNewListing(l => ({ ...l, images: [...l.images, result] }))
    }
    reader.readAsDataURL(file)
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
      <Logo size={48}/><div style={{ color: C.muted, fontSize: 14 }}>Loading your dashboard...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: C.forest, padding: '16px 20px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo size={34}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {unread > 0 && <div style={{ background: C.red, color: C.white, borderRadius: 20, minWidth: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, padding: '0 6px' }}>{unread}</div>}
            <button onClick={signOut} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10, padding: '8px 12px', color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
              <LogOut size={14}/> Sign out
            </button>
          </div>
        </div>
        {tab === 'dashboard' && (
          <div style={{ marginTop: 16 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Landlord Portal</div>
            <div style={{ color: C.white, fontSize: 20, fontWeight: 800, marginTop: 2 }}>Your Overview</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 700, margin: '0 auto', width: '100%' }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.forestLight})`, borderRadius: 20, padding: '20px', marginBottom: 16, color: C.white }}>
              <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 4 }}>Rent collected this month</div>
              <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px' }}>{formatUGX(totalCollected)}</div>
              <div style={{ fontSize: 13, opacity: 0.5, marginTop: 2 }}>of {formatUGX(totalExpected)} expected</div>
              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.15)', borderRadius: 6, height: 6 }}>
                <div style={{ background: C.ochre, borderRadius: 6, height: 6, width: `${collectRate}%` }} />
              </div>
              <div style={{ color: C.ochre, fontSize: 12, fontWeight: 700, marginTop: 6 }}>{collectRate}% collection rate</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Properties', value: properties.length, color: C.forest, icon: <Building2 size={18}/> },
                { label: 'Tenants', value: tenants.length, color: C.ochre, icon: <Users size={18}/> },
                { label: 'Paid up', value: tenants.length - unpaidTenants.length, color: C.green, icon: <CheckCircle size={18}/> },
                { label: 'Arrears', value: unpaidTenants.length, color: C.red, icon: <AlertTriangle size={18}/> },
              ].map(s => (
                <div key={s.label} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.charcoal }}>{s.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {unpaidTenants.length > 0 && (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 12 }}>In Arrears</h3>
                {unpaidTenants.map((t: any) => (
                  <div key={t.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.red}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontWeight: 700 }}>{t.full_name}</div><div style={{ fontSize: 12, color: C.muted }}>Unit {t.unit_number}</div></div>
                    <div style={{ fontWeight: 800, color: C.red }}>{formatUGX(t.rent_amount)}</div>
                  </div>
                ))}
              </>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowAddProp(true)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'left' }}>
                <Plus size={20} color={C.forest} style={{ marginBottom: 8 }}/><div style={{ fontWeight: 700, fontSize: 14 }}>Add Property</div>
              </button>
              <button onClick={() => setTab('tenants')} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'left' }}>
                <Users size={20} color={C.ochre} style={{ marginBottom: 8 }}/><div style={{ fontWeight: 700, fontSize: 14 }}>Onboard Tenant</div>
              </button>
            </div>
          </div>
        )}

        {/* PROPERTIES */}
        {tab === 'properties' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, margin: 0 }}>Properties</h2>
              <Btn variant="ochre" size="sm" onClick={() => setShowAddProp(true)}><Plus size={15}/> Add</Btn>
            </div>
            {properties.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
                <Building2 size={48} color={C.border} style={{ margin: '0 auto 12px' }}/>
                <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>No properties yet</div>
                <div style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Add your first property to get started</div>
                <Btn variant="primary" onClick={() => setShowAddProp(true)}><Plus size={15}/> Add Property</Btn>
              </div>
            )}
            {properties.map((p: any) => (
              <div key={p.id} style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: 18, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.charcoal }}>{PROP_TYPES.find(t => t.value === p.type)?.icon} {p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.muted, fontSize: 13, marginTop: 4 }}><MapPin size={12}/>{p.location}</div>
                  </div>
                  <Badge color={C.forest}>{p.type}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 0, background: C.canvas, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
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
              <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, margin: 0 }}>{selectedProp ? selectedProp.name : 'All Tenants'}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedProp && <Btn variant="ghost" size="sm" onClick={() => setSelectedProp(null)}><X size={13}/></Btn>}
                {selectedProp && <Btn variant="ochre" size="sm" onClick={() => setShowAddTenant(true)}><Plus size={13}/> Onboard</Btn>}
              </div>
            </div>
            {!selectedProp && (
              <div style={{ marginBottom: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {properties.map((p: any) => (
                  <button key={p.id} onClick={() => setSelectedProp(p)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '7px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13, color: C.forest }}>
                    {PROP_TYPES.find(t => t.value === p.type)?.icon} {p.name}
                  </button>
                ))}
              </div>
            )}
            {(selectedProp ? tenants.filter((t: any) => t.property_id === selectedProp.id) : tenants).map((t: any) => {
              const paid = payments.find((p: any) => p.tenant_id === t.tenant_id && p.status === 'confirmed')
              return (
                <div key={t.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `3px solid ${paid ? C.green : C.red}`, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: C.charcoal }}>{t.full_name}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><DoorOpen size={12}/> Unit {t.unit_number}</div>
                      <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12}/> {t.phone}</div>
                      <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><IdCard size={12}/> {t.national_id}</div>
                      <div style={{ marginTop: 8 }}><Badge color={paid ? C.green : C.red}>{paid ? '✓ Paid' : 'Unpaid'}</Badge></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: 15 }}>{formatUGX(t.rent_amount)}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>/month</div>
                    </div>
                  </div>
                </div>
              )
            })}
            {tenants.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>No tenants yet.</div>}
          </div>
        )}

        {/* PAYMENTS */}
        {tab === 'payments' && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 16 }}>Payments</h2>
            <div style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.forestLight})`, borderRadius: 20, padding: 20, marginBottom: 16, color: C.white }}>
              <div style={{ fontSize: 13, opacity: 0.65 }}>Collected this month</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 2 }}>{formatUGX(totalCollected)}</div>
              <div style={{ fontSize: 13, opacity: 0.5 }}>of {formatUGX(totalExpected)}</div>
              <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 4, height: 6 }}>
                <div style={{ background: C.ochre, borderRadius: 4, height: 6, width: `${collectRate}%` }} />
              </div>
            </div>
            {payments.map((p: any) => (
              <div key={p.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.tenant_name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.payment_method?.replace(/_/g, ' ')} · {new Date(p.created_at).toLocaleDateString()}</div>
                  {p.reference && <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>Ref: {p.reference}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre }}>{formatUGX(p.amount)}</div>
                  <Badge color={p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre}>{p.status}</Badge>
                </div>
              </div>
            ))}
            {payments.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>No payments yet.</div>}
          </div>
        )}

        {/* ALERTS */}
        {tab === 'alerts' && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, marginBottom: 16 }}>Alerts</h2>
            {alerts.map((a: any) => (
              <div key={a.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `3px solid ${a.type === 'security' ? C.red : C.ochre}`, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}><Badge color={a.type === 'security' ? C.red : C.ochre}>{a.type}</Badge></div>
                <div style={{ fontSize: 14, color: C.body }}>{a.message}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>From {a.sender_name}</div>
              </div>
            ))}
            {alerts.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>No alerts yet.</div>}
          </div>
        )}

        {/* LISTINGS */}
        {tab === 'listings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: C.charcoal, margin: 0 }}>Listings</h2>
              <Btn variant="ochre" size="sm" onClick={() => setShowAddListing(true)}><Plus size={15}/> Add</Btn>
            </div>
            <div style={{ background: C.mint, borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: C.forest, lineHeight: 1.6 }}>
              Listings are public — anyone can browse before signing up.
            </div>
            {listings.map((l: any) => (
              <div key={l.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 18, marginBottom: 12 }}>
                {l.images?.[0] && <img src={l.images[0]} alt={l.title} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }}/>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div><div style={{ fontWeight: 800, fontSize: 15 }}>{l.title}</div><div style={{ fontSize: 13, color: C.muted }}>{l.location} · Unit {l.unit_number}</div></div>
                  <Badge color={l.is_available ? C.green : C.red}>{l.is_available ? 'Available' : 'Taken'}</Badge>
                </div>
                <div style={{ fontWeight: 900, fontSize: 18, color: C.forest, marginBottom: 8 }}>{formatUGX(l.rent_amount)}<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>/mo</span></div>
                {l.amenities?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {l.amenities.map((a: string) => <span key={a} style={{ background: C.canvas, borderRadius: 6, padding: '3px 8px', fontSize: 11, color: C.forest, fontWeight: 600 }}>{a}</span>)}
                  </div>
                )}
                <div style={{ background: C.canvas, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 2 }}>Invite Code</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, color: C.forest, letterSpacing: 2 }}>{l.invite_link}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => { navigator.clipboard?.writeText(l.invite_link); showToast('Code copied!') }}><Copy size={13}/> Copy</Btn>
                  <Btn variant="secondary" size="sm" onClick={async () => { await apiFetch('/api/landlord/listings/' + l.id, { method: 'PATCH', body: JSON.stringify({ is_available: !l.is_available }) }); fetchData() }}>{l.is_available ? 'Mark Taken' : 'Mark Available'}</Btn>
                  <Btn variant="danger" size="sm" onClick={async () => { await apiFetch('/api/landlord/listings/' + l.id, { method: 'DELETE' }); fetchData(); showToast('Listing removed') }}><Trash2 size={13}/></Btn>
                </div>
              </div>
            ))}
            {listings.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>No listings yet.</div>}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100 }}>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ flex: 1, padding: '10px 2px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: tab === n.key ? C.forest : C.muted, position: 'relative' }}>
            {(n.badge ?? 0) > 0 && <div style={{ position: 'absolute', top: 6, right: '50%', transform: 'translateX(10px)', background: C.red, color: C.white, borderRadius: 20, minWidth: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.badge}</div>}
            <div style={{ transform: tab === n.key ? 'scale(1.1)' : 'scale(1)' }}>{n.icon}</div>
            <div style={{ fontSize: 9, fontWeight: tab === n.key ? 700 : 500 }}>{n.label}</div>
            {tab === n.key && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, background: C.forest, borderRadius: '0 0 4px 4px' }} />}
          </button>
        ))}
      </div>

      {/* Add Property Modal */}
      <Modal open={showAddProp} onClose={() => setShowAddProp(false)} title="Add Property">
        <Input label="Property Name" placeholder="e.g. Nakasero Heights" value={newProp.name} onChange={(v: string) => setNewProp(p => ({ ...p, name: v }))} />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Property Type</label>
          <select value={newProp.type} onChange={e => setNewProp(p => ({ ...p, type: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}>
            {PROP_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </select>
        </div>
        <Input label="Location" placeholder="e.g. Kololo, Kampala" value={newProp.location} onChange={(v: string) => setNewProp(p => ({ ...p, location: v }))} />
        <Input label="Number of Units" placeholder="e.g. 12" value={newProp.total_units} onChange={(v: string) => setNewProp(p => ({ ...p, total_units: v }))} type="number" />
        <div style={{ background: '#FFF8EC', border: `1px solid ${C.ochre}30`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.ochre, marginBottom: 4 }}>📋 Proof of Ownership Required</div>
          <div style={{ fontSize: 12, color: C.body, lineHeight: 1.6 }}>After adding your property, you will be asked to upload a title deed, tenancy agreement, or utility bill to verify ownership. Unverified properties are shown with a pending badge.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={() => setShowAddProp(false)} full>Cancel</Btn>
          <Btn variant="primary" onClick={addProperty} full disabled={saving}>{saving ? 'Saving...' : 'Add Property'}</Btn>
        </div>
      </Modal>

      {/* Add Tenant Modal */}
      <Modal open={showAddTenant} onClose={() => setShowAddTenant(false)} title={`Onboard Tenant — ${selectedProp?.name}`}>
        <div style={{ background: C.mint, borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.forest, textTransform: 'uppercase' as const }}>Invite Code</div>
            <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900, color: C.forest, letterSpacing: 6 }}>{selectedProp?.invite_code}</div>
          </div>
          <button onClick={() => { navigator.clipboard?.writeText(selectedProp?.invite_code || ''); showToast('Copied!') }} style={{ background: C.forest, border: 'none', borderRadius: 8, padding: '8px 12px', color: C.white, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Copy size={13}/> Copy</button>
        </div>
        <Input label="Full Name" placeholder="e.g. Aisha Namutebi" value={newTenant.full_name} onChange={(v: string) => setNewTenant(t => ({ ...t, full_name: v }))} />
        <Input label="National ID" placeholder="CM9200001234" value={newTenant.national_id} onChange={(v: string) => setNewTenant(t => ({ ...t, national_id: v }))} />
        <Input label="Phone" placeholder="0772 100 001" value={newTenant.phone} onChange={(v: string) => setNewTenant(t => ({ ...t, phone: v }))} type="tel" />
        <Input label="Email (optional)" placeholder="tenant@email.com" value={newTenant.email} onChange={(v: string) => setNewTenant(t => ({ ...t, email: v }))} type="email" />
        <Input label="Unit / Room" placeholder="e.g. A1" value={newTenant.unit} onChange={(v: string) => setNewTenant(t => ({ ...t, unit: v }))} />
        <Input label="Monthly Rent (UGX)" placeholder="e.g. 850000" value={newTenant.rent} onChange={(v: string) => setNewTenant(t => ({ ...t, rent: v }))} type="number" />
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={() => setShowAddTenant(false)} full>Cancel</Btn>
          <Btn variant="primary" onClick={addTenant} full disabled={saving}>{saving ? 'Saving...' : 'Onboard'}</Btn>
        </div>
      </Modal>

      {/* Add Listing Modal */}
      <Modal open={showAddListing} onClose={() => setShowAddListing(false)} title="Add Listing">
        {/* Images */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Photos</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {newListing.images.map((img, i) => (
              <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                <img src={img} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}/>
                <button onClick={() => setNewListing(l => ({ ...l, images: l.images.filter((_, idx) => idx !== i) }))} style={{ position: 'absolute', top: -6, right: -6, background: C.red, border: 'none', borderRadius: '50%', width: 20, height: 20, color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>×</button>
              </div>
            ))}
            {newListing.images.length < 6 && (
              <label style={{ width: 80, height: 80, border: `2px dashed ${C.border}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted }}>
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} style={{ display: 'none' }}/>
                <ImageIcon size={20}/>
                <span style={{ fontSize: 10, marginTop: 4 }}>Add</span>
              </label>
            )}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Property</label>
          <select value={newListing.property_id} onChange={e => { const p = properties.find(x => x.id === e.target.value); setNewListing(l => ({ ...l, property_id: e.target.value, property_type: p?.type || 'apartment', location: p?.location || '' })) }} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}>
            <option value="">Select property...</option>
            {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Input label="Listing Title" placeholder="e.g. Spacious 2BR in Nakasero" value={newListing.title} onChange={(v: string) => setNewListing(l => ({ ...l, title: v }))} />
        <Input label="Unit Number" placeholder="e.g. A1" value={newListing.unit_number} onChange={(v: string) => setNewListing(l => ({ ...l, unit_number: v }))} />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Description</label>
          <textarea placeholder="Describe the property — size, floor, views, neighbours..." value={newListing.description} onChange={e => setNewListing(l => ({ ...l, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const, fontFamily: 'inherit', resize: 'none' as const }} />
        </div>
        <Input label="Monthly Rent (UGX)" placeholder="e.g. 850000" value={newListing.rent_amount} onChange={(v: string) => setNewListing(l => ({ ...l, rent_amount: v }))} type="number" />
        <Input label="Deposit (UGX)" placeholder="e.g. 1700000" value={newListing.deposit_amount} onChange={(v: string) => setNewListing(l => ({ ...l, deposit_amount: v }))} type="number" />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Amenities</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AMENITIES.map(a => {
              const selected = newListing.amenities.includes(a.key)
              return (
                <button key={a.key} onClick={() => setNewListing(l => ({ ...l, amenities: selected ? l.amenities.filter(x => x !== a.key) : [...l.amenities, a.key] }))}
                  style={{ padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${selected ? C.forest : C.border}`, background: selected ? C.mint : C.white, color: selected ? C.forest : C.muted, fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {a.icon} {a.key}
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={() => setShowAddListing(false)} full>Cancel</Btn>
          <Btn variant="ochre" onClick={addListing} full disabled={saving}>{saving ? 'Publishing...' : 'Publish Listing'}</Btn>
        </div>
      </Modal>

      {/* Invite Code Modal */}
      <Modal open={!!showCode && !showAddTenant} onClose={() => setShowCode(null)} title="Tenant Invite Code">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 900, letterSpacing: 10, color: C.forest }}>{showCode}</div>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>Share this with your tenant so they can join your property.</p>
          <Btn variant="primary" onClick={() => { navigator.clipboard?.writeText(showCode || ''); showToast('Copied!'); setShowCode(null) }} full style={{ marginTop: 20, justifyContent: 'center' }}><Copy size={16}/> Copy Code</Btn>
        </div>
      </Modal>

      <Toast msg={toast.msg} visible={toast.show}/>
    </div>
  )
}
