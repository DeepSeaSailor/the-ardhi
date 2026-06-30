'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import Sidebar from '@/components/Sidebar'
import { getSession, clearSession } from '@/lib/session'
import {
  Building2, Users, CreditCard, Bell, List, Settings, Download, FileSpreadsheet,
  Plus, AlertTriangle, CheckCircle, MapPin, X,
  Copy, Phone, IdCard, DoorOpen, Trash2, Pencil,
  LogOut, Image as ImageIcon, Upload, FileCheck, Wifi, Shield, Car,
  Zap, Droplets, Tv, Wind, Waves, Dumbbell, Trees,
  Coffee, Utensils, Flame, Sun, Lock, Dog, Star, Eye, EyeOff,
  MessageSquare, ChevronLeft, ChevronRight, RefreshCw, Key
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
  return <span style={{ background: color + '18', color, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{children}</span>
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

function SectionTab({ tabs, active, onChange }: any) {
  return (
    <div style={{ display: 'flex', gap: 0, background: C.canvas, borderRadius: 12, padding: 3, marginBottom: 18, overflowX: 'auto' as const }}>
      {tabs.map((t: any) => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{ flex: '0 0 auto', padding: '8px 14px', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer', background: active === t.key ? C.white : 'transparent', color: active === t.key ? C.forest : C.muted, boxShadow: active === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' as const }}>
          {t.icon} {t.label} {t.badge ? <span style={{ background: C.red, color: C.white, borderRadius: 10, minWidth: 16, height: 16, fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{t.badge}</span> : null}
        </button>
      ))}
    </div>
  )
}

export default function LandlordDashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState('properties')
  const [propDetailTab, setPropDetailTab] = useState('tenants')
  const [properties, setProperties] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProp, setSelectedProp] = useState<any>(null)
  const [showAddProp, setShowAddProp] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [exportFrom, setExportFrom] = useState('')
  const [exportTo, setExportTo] = useState('')
  const [exporting, setExporting] = useState(false)
  const [editingProp, setEditingProp] = useState<any>(null)
  const [editProp, setEditProp] = useState({ name: '', type: 'apartment', location: '', total_units: '' })
  const [showAddTenant, setShowAddTenant] = useState(false)
  const [showAddListing, setShowAddListing] = useState(false)
  const [showCode, setShowCode] = useState<string | null>(null)
  const [showCodeLabel, setShowCodeLabel] = useState('')
  const [uploadingDocPropId, setUploadingDocPropId] = useState<string | null>(null)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '' })
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [msgThread, setMsgThread] = useState<any>(null)
  const [msgReply, setMsgReply] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [showNotifPanel, setShowNotifPanel] = useState(false)

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
      const [pRes, tRes, payRes, aRes, mRes, lRes, rRes] = await Promise.all([
        apiFetch('/api/landlord/properties'),
        apiFetch('/api/landlord/tenants'),
        apiFetch('/api/landlord/payments'),
        apiFetch('/api/landlord/alerts'),
        apiFetch('/api/landlord/messages'),
        apiFetch('/api/landlord/listings'),
        apiFetch('/api/landlord/reviews'),
      ])
      const [p, t, pay, a, m, l, r] = await Promise.all([pRes.json(), tRes.json(), payRes.json(), aRes.json(), mRes.json(), lRes.json(), rRes.json()])
      setProperties(p.data || [])
      setTenants(t.data || [])
      setPayments(pay.data || [])
      setAlerts(a.data || [])
      setMessages(m.data || [])
      setListings(l.data || [])
      setReviews(r.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [userId, apiFetch])

  useEffect(() => { if (userId) fetchData() }, [userId, fetchData])

  function signOut() { clearSession(); router.push('/') }

  async function uploadOwnershipDoc(propId: string, file: File) {
    setUploadingDoc(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const res = await apiFetch(`/api/landlord/properties/${propId}/upload-doc`, {
          method: 'POST',
          body: JSON.stringify({ doc_base64: base64, doc_name: file.name })
        })
        if (res.ok) {
          showToast('Document uploaded — under review')
          fetchData()
        } else {
          const d = await res.json()
          showToast(d.error || 'Upload failed')
        }
        setUploadingDocPropId(null)
        setUploadingDoc(false)
      }
      reader.readAsDataURL(file)
    } catch {
      showToast('Upload failed')
      setUploadingDoc(false)
    }
  }

  function OwnershipStatusBadge({ status }: { status: string }) {
    const map: Record<string, { color: string; label: string }> = {
      none: { color: C.muted, label: 'No ownership doc' },
      under_review: { color: C.ochre, label: '⏳ Under Review' },
      verified: { color: C.green, label: '✓ Ownership Verified' },
      rejected: { color: C.red, label: '✗ Doc Rejected' },
    }
    const s = map[status] || map['none']
    return <span style={{ background: s.color + '18', color: s.color, border: `1px solid ${s.color}30`, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>{s.label}</span>
  }

  async function deleteLandlordAccount() {
    setSaving(true)
    try {
      const res = await apiFetch('/api/auth/delete-account', { method: 'DELETE' })
      if (res.ok) { clearSession(); router.push('/') }
      else { const d = await res.json(); showToast(d.error || 'Failed to delete account') }
    } finally { setSaving(false) }
  }

  async function changeLandlordPassword() {
    if (newPassword.length < 6) { showToast('Password must be at least 6 characters'); return }
    setSaving(true)
    try {
      const res = await apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ password: newPassword }) })
      if (res.ok) { showToast('Password changed'); setNewPassword('') }
      else showToast('Failed — try again')
    } finally { setSaving(false) }
  }

  async function runExport() {
    if (!selectedProp) { showToast('Open a property first'); return }
    setExporting(true)
    try {
      const params = new URLSearchParams({ property_id: selectedProp.id })
      if (exportFrom) params.set('date_from', exportFrom)
      if (exportTo) params.set('date_to', exportTo)
      const res = await apiFetch('/api/landlord/export?' + params.toString())
      if (!res.ok) { const d = await res.json(); showToast(d.error || 'Export failed'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const cd = res.headers.get('Content-Disposition') || ''
      const fn = cd.match(/filename="(.+)"/)?.[1] || 'Ardhi-Export.xlsx'
      a.href = url; a.download = fn; a.click()
      URL.revokeObjectURL(url)
      showToast('Export downloaded!')
      setShowExport(false)
    } finally { setExporting(false) }
  }

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
      setShowCodeLabel('Property Invite Code')
      fetchData()
      setNewProp({ name: '', type: 'apartment', location: '', total_units: '' })
    } finally { setSaving(false) }
  }

  async function saveEditProp() {
    if (!editProp.name || !editProp.location || !editProp.total_units) { showToast('Please fill all fields'); return }
    setSaving(true)
    try {
      const res = await apiFetch('/api/landlord/properties/' + editingProp.id, {
        method: 'PATCH',
        body: JSON.stringify({ name: editProp.name, type: editProp.type, location: editProp.location, total_units: parseInt(editProp.total_units) })
      })
      if (res.ok) {
        setProperties(prev => prev.map((p: any) => p.id === editingProp.id ? { ...p, ...editProp, total_units: parseInt(editProp.total_units) } : p))
        if (selectedProp?.id === editingProp.id) setSelectedProp((prev: any) => ({ ...prev, ...editProp, total_units: parseInt(editProp.total_units) }))
        showToast('Property updated')
        setEditingProp(null)
      } else {
        const d = await res.json()
        showToast(d.error || 'Failed to update')
      }
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

  async function sendReply() {
    if (!msgReply.trim() || !msgThread) return
    setSendingMsg(true)
    try {
      const res = await apiFetch('/api/landlord/messages', {
        method: 'POST',
        body: JSON.stringify({ receiver_id: msgThread.other_id, content: msgReply.trim(), property_id: msgThread.property_id })
      })
      if (res.ok) {
        setMsgReply('')
        fetchData()
        showToast('Message sent')
      }
    } finally { setSendingMsg(false) }
  }

  function handleImageUpload(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setNewListing(l => ({ ...l, images: [...l.images, result] }))
    }
    reader.readAsDataURL(file)
  }

  // Compute derived data
  const propTenants = selectedProp ? tenants.filter((t: any) => t.property_id === selectedProp.id) : []
  const propPayments = selectedProp ? payments.filter((p: any) => {
    const tenant = tenants.find((t: any) => t.tenant_id === p.tenant_id && t.property_id === selectedProp.id)
    return !!tenant
  }) : []
  const propAlerts = selectedProp ? alerts.filter((a: any) => a.property_id === selectedProp.id) : []
  const propMessages = selectedProp ? messages.filter((m: any) => m.property_id === selectedProp.id) : []
  const propReviews = selectedProp ? reviews.filter((r: any) => r.property_id === selectedProp.id) : []

  // Build message threads from messages
  const buildThreads = (msgs: any[], myId: string) => {
    const threads: Record<string, any> = {}
    msgs.forEach(m => {
      const other_id = m.sender_id === myId ? m.receiver_id : m.sender_id
      const other_name = m.sender_id === myId ? m.receiver?.full_name : m.sender?.full_name
      const key = other_id + '_' + (m.property_id || '')
      if (!threads[key]) threads[key] = { other_id, other_name, property_id: m.property_id, msgs: [], unread: 0 }
      threads[key].msgs.push(m)
      if (m.sender_id !== myId && !m.is_read) threads[key].unread++
    })
    return Object.values(threads)
  }

  const allThreads = userId ? buildThreads(messages, userId) : []
  const propThreads = selectedProp ? allThreads.filter((t: any) => t.property_id === selectedProp.id) : []

  const unreadAlerts = alerts.filter((a: any) => !a.is_read).length
  const unreadMessages = messages.filter((m: any) => m.receiver_id === userId && !m.is_read).length
  const totalNotifs = unreadAlerts + unreadMessages
  const totalCollected = payments.filter((p: any) => p.status === 'confirmed').reduce((s: number, p: any) => s + (p.amount || 0), 0)
  const totalExpected = tenants.reduce((s: number, t: any) => s + (t.rent_amount || 0), 0)

  // Generate invite codes per unit
  const propUnits = selectedProp ? Array.from({ length: selectedProp.total_units }, (_, i) => {
    const unitLabel = `Unit ${i + 1}`
    const tenant = propTenants.find((t: any) => t.unit_number === String(i + 1) || t.unit_number === unitLabel)
    return { number: i + 1, label: unitLabel, tenant, occupied: !!tenant }
  }) : []

  const avgRating = propReviews.length ? (propReviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / propReviews.length).toFixed(1) : null

  const NAV = [
    { key: 'properties', icon: <Building2 size={20}/>, label: 'Properties' },
    { key: 'messages', icon: <MessageSquare size={20}/>, label: 'Messages', badge: unreadMessages > 0 ? unreadMessages : undefined },
    { key: 'listings', icon: <List size={20}/>, label: 'Listings' },
    { key: 'settings', icon: <Settings size={20}/>, label: 'Settings' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, flexDirection: 'column', gap: 16 }}>
      <Logo size={48}/><div style={{ color: C.muted, fontSize: 14 }}>Loading your dashboard...</div>
    </div>
  )

  const sidebarNav = NAV.map(n => ({ key: n.key, icon: n.icon, label: n.label, badge: n.badge }))

  // ─── Property Detail View ───────────────────────────────────────────────────
  if (selectedProp) {
    const detailTabs = [
      { key: 'tenants', label: 'Tenants', icon: <Users size={13}/>, badge: propTenants.length || undefined },
      { key: 'units', label: 'Units & Codes', icon: <Key size={13}/> },
      { key: 'amenities', label: 'Amenities', icon: <Wifi size={13}/> },
      { key: 'payments', label: 'Payments', icon: <CreditCard size={13}/>, badge: propPayments.filter((p: any) => p.status === 'pending').length || undefined },
      { key: 'ratings', label: 'Ratings', icon: <Star size={13}/>, badge: propReviews.length || undefined },
      { key: 'messages', label: 'Messages', icon: <MessageSquare size={13}/>, badge: propThreads.reduce((s: number, t: any) => s + t.unread, 0) || undefined },
      { key: 'alerts', label: 'Alerts', icon: <Bell size={13}/>, badge: propAlerts.filter((a: any) => !a.is_read).length || undefined },
    ]

    return (
      <div className="app-shell" style={{ minHeight: '100vh', background: C.canvas }}>
        <Sidebar nav={sidebarNav} tab={tab} setTab={(t: string) => { setTab(t); setSelectedProp(null) }} onSignOut={signOut} role="Landlord"/>
        <div className="main-content" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 80, minHeight: '100vh' }}>
          {/* Header */}
          <div style={{ background: C.forest, padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setSelectedProp(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '7px 12px', color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                <ChevronLeft size={16}/> Properties
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditingProp(selectedProp); setEditProp({ name: selectedProp.name, type: selectedProp.type, location: selectedProp.location, total_units: String(selectedProp.total_units) }) }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '7px 10px', color: C.white, cursor: 'pointer' }}><Pencil size={15}/></button>
                <button onClick={() => setShowExport(true)} style={{ background: C.ochre, border: 'none', borderRadius: 10, padding: '7px 12px', color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                  <Download size={15}/> Export
                </button>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{PROP_TYPES.find(t => t.value === selectedProp.type)?.icon} {selectedProp.type}</div>
              <div style={{ color: C.white, fontSize: 22, fontWeight: 900, marginTop: 2 }}>{selectedProp.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12}/>{selectedProp.location}</div>
            </div>
            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              {[
                { label: 'Units', value: selectedProp.total_units },
                { label: 'Occupied', value: selectedProp.occupied_units || propTenants.length },
                { label: 'Vacant', value: selectedProp.total_units - (selectedProp.occupied_units || propTenants.length) },
                { label: 'Rating', value: avgRating ? `${avgRating}★` : '—' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px', textAlign: 'center', flex: 1 }}>
                  <div style={{ color: C.white, fontWeight: 900, fontSize: 16 }}>{s.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, padding: '24px 28px', maxWidth: 960, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const }}>
            <SectionTab tabs={detailTabs} active={propDetailTab} onChange={setPropDetailTab}/>

            {/* TENANTS */}
            {propDetailTab === 'tenants' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
                  <Btn variant="ochre" size="sm" onClick={() => setShowAddTenant(true)}><Plus size={13}/> Onboard Tenant</Btn>
                </div>
                {propTenants.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted, background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}><Users size={32} color={C.border} style={{ margin: '0 auto 10px' }}/><div>No tenants yet for this property.</div></div>}
                {propTenants.map((t: any) => {
                  const paid = propPayments.find((p: any) => p.tenant_id === t.tenant_id && p.status === 'confirmed')
                  return (
                    <div key={t.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `3px solid ${paid ? C.green : C.red}`, padding: 16, marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: C.charcoal }}>{t.full_name}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><DoorOpen size={12}/> Unit {t.unit_number}</div>
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
              </div>
            )}

            {/* UNITS & INVITE CODES */}
            {propDetailTab === 'units' && (
              <div>
                <div style={{ background: C.mint, borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: C.forest, lineHeight: 1.6 }}>
                  Share the property code <strong>{selectedProp.invite_code}</strong> with tenants to let them join, or copy a unit-specific code below.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.charcoal }}>Property Code</div>
                  <button onClick={() => { navigator.clipboard?.writeText(selectedProp.invite_code); showToast('Code copied!') }} style={{ background: C.forest, border: 'none', borderRadius: 8, padding: '7px 14px', color: C.white, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}><Copy size={13}/> {selectedProp.invite_code}</button>
                </div>
                <div style={{ height: 1, background: C.border, marginBottom: 16 }}/>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.charcoal, marginBottom: 12 }}>Units ({selectedProp.total_units})</div>
                {propUnits.map((u: any) => (
                  <div key={u.number} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, borderLeft: `3px solid ${u.occupied ? C.green : C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: C.charcoal }}>{u.label}</div>
                      {u.tenant ? (
                        <div style={{ fontSize: 12, color: C.green, marginTop: 2, fontWeight: 600 }}>✓ {u.tenant.full_name}</div>
                      ) : (
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Vacant</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Badge color={u.occupied ? C.green : C.muted}>{u.occupied ? 'Occupied' : 'Vacant'}</Badge>
                      <button onClick={() => { const code = selectedProp.invite_code + '-U' + u.number; navigator.clipboard?.writeText(code); showToast(`Code copied: ${code}`) }} style={{ background: C.canvas, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: C.forest, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Key size={11}/> Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AMENITIES */}
            {propDetailTab === 'amenities' && (
              <div>
                {(!selectedProp.amenities || selectedProp.amenities.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: 40, color: C.muted, background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
                    <Wifi size={32} color={C.border} style={{ margin: '0 auto 10px' }}/>
                    <div style={{ marginBottom: 12 }}>No amenities listed for this property.</div>
                    <div style={{ fontSize: 13, color: C.muted }}>Edit the property to add amenities.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {selectedProp.amenities.map((a: string) => {
                      const am = AMENITIES.find(x => x.key === a)
                      return (
                        <div key={a} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, color: C.forest }}>
                          {am?.icon} {a}
                        </div>
                      )
                    })}
                  </div>
                )}
                <div style={{ marginTop: 16 }}>
                  <Btn variant="secondary" size="sm" onClick={() => { setEditingProp(selectedProp); setEditProp({ name: selectedProp.name, type: selectedProp.type, location: selectedProp.location, total_units: String(selectedProp.total_units) }) }}>
                    <Pencil size={13}/> Edit Amenities
                  </Btn>
                </div>
              </div>
            )}

            {/* PAYMENTS */}
            {propDetailTab === 'payments' && (
              <div>
                {propPayments.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted, background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}><CreditCard size={32} color={C.border} style={{ margin: '0 auto 10px' }}/><div>No payments yet for this property.</div></div>}
                {propPayments.map((p: any) => (
                  <div key={p.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{p.tenant_name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{p.payment_method?.replace(/_/g, ' ')} · {new Date(p.created_at).toLocaleDateString()}</div>
                      {p.reference && <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>Ref: {p.reference}</div>}
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                      <div style={{ fontWeight: 900, fontSize: 15, color: p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre }}>{formatUGX(p.amount)}</div>
                      <Badge color={p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre}>{p.status}</Badge>
                      <button onClick={async () => { setPayments(prev => prev.filter((x: any) => x.id !== p.id)); apiFetch('/api/landlord/payments/' + p.id, { method: 'DELETE' }).then(() => showToast('Payment deleted')).catch(() => fetchData()) }} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600 }}><Trash2 size={11}/> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RATINGS */}
            {propDetailTab === 'ratings' && (
              <div>
                {propReviews.length > 0 && (
                  <div style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.forestLight})`, borderRadius: 16, padding: 20, marginBottom: 16, color: C.white, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{avgRating}</div>
                      <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>out of 5</div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                        {[1,2,3,4,5].map(i => <Star key={i} size={20} fill={i <= Math.round(parseFloat(avgRating || '0')) ? C.ochre : 'transparent'} color={C.ochre}/>)}
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.65 }}>{propReviews.length} review{propReviews.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                )}
                {propReviews.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted, background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}><Star size={32} color={C.border} style={{ margin: '0 auto 10px' }}/><div>No reviews yet for this property.</div></div>}
                {propReviews.map((r: any) => (
                  <div key={r.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, color: C.charcoal }}>{r.tenant?.full_name || 'Tenant'}</div>
                      <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= r.rating ? C.ochre : 'transparent'} color={C.ochre}/>)}</div>
                    </div>
                    {r.comment && <div style={{ fontSize: 14, color: C.body, lineHeight: 1.6 }}>{r.comment}</div>}
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}

            {/* MESSAGES (property-specific) */}
            {propDetailTab === 'messages' && (
              <div>
                {msgThread ? (
                  <div>
                    <button onClick={() => setMsgThread(null)} style={{ background: 'none', border: 'none', color: C.forest, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: 0 }}>
                      <ChevronLeft size={16}/> Back to threads
                    </button>
                    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 12 }}>
                      <div style={{ background: C.forest, padding: '12px 16px', color: C.white, fontWeight: 700, fontSize: 14 }}>{msgThread.other_name}</div>
                      <div style={{ padding: 16, maxHeight: 320, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {msgThread.msgs.map((m: any) => {
                          const isMine = m.sender_id === userId
                          return (
                            <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                              <div style={{ maxWidth: '75%', background: isMine ? C.forest : C.canvas, color: isMine ? C.white : C.charcoal, borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', fontSize: 14, lineHeight: 1.5 }}>
                                {m.content}
                                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={msgReply} onChange={e => setMsgReply(e.target.value)} placeholder="Type a reply..." onKeyDown={e => e.key === 'Enter' && sendReply()}
                        style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: C.white }} />
                      <button onClick={sendReply} disabled={!msgReply.trim() || sendingMsg} style={{ background: C.forest, border: 'none', borderRadius: 12, padding: '12px 18px', color: C.white, cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: !msgReply.trim() ? 0.5 : 1 }}>Send</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {propThreads.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted, background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}><MessageSquare size={32} color={C.border} style={{ margin: '0 auto 10px' }}/><div>No messages for this property.</div></div>}
                    {propThreads.map((th: any, i: number) => (
                      <button key={i} onClick={() => setMsgThread(th)} style={{ width: '100%', background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' as const }}>
                        <div>
                          <div style={{ fontWeight: 700, color: C.charcoal }}>{th.other_name || 'Tenant'}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{th.msgs[th.msgs.length - 1]?.content?.slice(0, 50)}...</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          {th.unread > 0 && <span style={{ background: C.red, color: C.white, borderRadius: 10, minWidth: 20, height: 20, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{th.unread}</span>}
                          <ChevronRight size={16} color={C.muted}/>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ALERTS (property-specific) */}
            {propDetailTab === 'alerts' && (
              <div>
                {propAlerts.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted, background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}><Bell size={32} color={C.border} style={{ margin: '0 auto 10px' }}/><div>No alerts for this property.</div></div>}
                {propAlerts.map((a: any) => (
                  <div key={a.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `3px solid ${a.type === 'security' ? C.red : C.ochre}`, padding: 16, marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, justifyContent: 'space-between' }}>
                      <Badge color={a.type === 'security' ? C.red : C.ochre}>{a.type}</Badge>
                      <span style={{ fontSize: 11, color: C.muted }}>{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 14, color: C.body, lineHeight: 1.6 }}>{a.message}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>From {a.sender_name || 'Tenant'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Nav */}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100 }} className="bottom-nav">
            {NAV.map(n => (
              <button key={n.key} onClick={() => { setTab(n.key); setSelectedProp(null) }} style={{ flex: 1, padding: '10px 2px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: C.muted, position: 'relative' }}>
                <div>{n.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 500 }}>{n.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Modals for property detail */}
        <Modal open={showExport} onClose={() => setShowExport(false)} title={`Export — ${selectedProp.name}`}>
          <div style={{ background: C.mint, borderRadius: 12, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <FileSpreadsheet size={18} color={C.forest} style={{ marginTop: 2, flexShrink: 0 }}/>
            <div style={{ fontSize: 13, color: C.forest, lineHeight: 1.6 }}>
              Exports a full Excel report (Summary, Units, Tenants, Contacts, Payments) for <strong>{selectedProp.name}</strong>.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>From Date</label>
              <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>To Date</label>
              <input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>Leave dates blank to export all records.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowExport(false)} full>Cancel</Btn>
            <Btn variant="primary" onClick={runExport} full disabled={exporting}>
              <Download size={15}/> {exporting ? 'Generating...' : 'Download Excel'}
            </Btn>
          </div>
        </Modal>

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

        <Modal open={!!editingProp} onClose={() => setEditingProp(null)} title="Edit Property">
          <Input label="Property Name" placeholder="e.g. Nakasero Heights" value={editProp.name} onChange={(v: string) => setEditProp(p => ({ ...p, name: v }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Property Type</label>
            <select value={editProp.type} onChange={e => setEditProp(p => ({ ...p, type: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}>
              {PROP_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
          </div>
          <Input label="Location" placeholder="e.g. Kololo, Kampala" value={editProp.location} onChange={(v: string) => setEditProp(p => ({ ...p, location: v }))} />
          <Input label="Number of Units" placeholder="e.g. 12" value={editProp.total_units} onChange={(v: string) => setEditProp(p => ({ ...p, total_units: v }))} type="number" />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" onClick={() => setEditingProp(null)} full>Cancel</Btn>
            <Btn variant="primary" onClick={saveEditProp} full disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Btn>
          </div>
        </Modal>

        <Modal open={!!showCode} onClose={() => setShowCode(null)} title={showCodeLabel || 'Invite Code'}>
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 900, letterSpacing: 10, color: C.forest }}>{showCode}</div>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>Share this with your tenant so they can join your property.</p>
            <Btn variant="primary" onClick={() => { navigator.clipboard?.writeText(showCode || ''); showToast('Copied!'); setShowCode(null) }} full><Copy size={16}/> Copy Code</Btn>
          </div>
        </Modal>

        <Toast msg={toast.msg} visible={toast.show}/>
      </div>
    )
  }

  // ─── Main Portal (no property selected) ────────────────────────────────────
  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: C.canvas }}>
      <Sidebar nav={sidebarNav} tab={tab} setTab={setTab} onSignOut={signOut} role="Landlord"/>
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 80, minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ background: C.forest, padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Logo size={34}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setShowNotifPanel(!showNotifPanel)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '7px 10px', color: C.white, cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Bell size={18}/>
                {totalNotifs > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: C.red, color: C.white, borderRadius: 10, minWidth: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{totalNotifs}</span>}
              </button>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.ochre, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 15 }}>L</div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Landlord Portal</div>
            <div style={{ color: C.white, fontSize: 20, fontWeight: 800, marginTop: 2 }}>
              {tab === 'properties' && 'My Properties'}
              {tab === 'messages' && 'Messages'}
              {tab === 'listings' && 'Listings'}
              {tab === 'settings' && 'Settings'}
            </div>
          </div>
        </div>

        {/* Notification panel */}
        {showNotifPanel && (
          <div style={{ position: 'fixed', top: 80, right: 16, width: 300, background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 500, maxHeight: 400, overflowY: 'auto' as const }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontWeight: 800, fontSize: 15, display: 'flex', justifyContent: 'space-between' }}>
              Notifications <button onClick={() => setShowNotifPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={16}/></button>
            </div>
            {totalNotifs === 0 && <div style={{ padding: 20, textAlign: 'center', color: C.muted, fontSize: 13 }}>All caught up!</div>}
            {unreadMessages > 0 && (
              <button onClick={() => { setTab('messages'); setShowNotifPanel(false) }} style={{ width: '100%', padding: '12px 16px', border: 'none', borderBottom: `1px solid ${C.border}`, background: C.mint, cursor: 'pointer', textAlign: 'left' as const, display: 'flex', gap: 10, alignItems: 'center' }}>
                <MessageSquare size={16} color={C.forest}/>
                <div><div style={{ fontWeight: 700, fontSize: 13, color: C.charcoal }}>{unreadMessages} unread message{unreadMessages !== 1 ? 's' : ''}</div><div style={{ fontSize: 12, color: C.muted }}>Tap to open inbox</div></div>
              </button>
            )}
            {alerts.filter((a: any) => !a.is_read).slice(0, 4).map((a: any) => (
              <div key={a.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertTriangle size={15} color={a.type === 'security' ? C.red : C.ochre} style={{ marginTop: 1, flexShrink: 0 }}/>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: a.type === 'security' ? C.red : C.ochre, textTransform: 'uppercase' as const }}>{a.type}</div>
                  <div style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}>{a.message.slice(0, 80)}{a.message.length > 80 ? '...' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, padding: '20px 16px', maxWidth: 700, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const }}>

          {/* PROPERTIES LIST */}
          {tab === 'properties' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: C.muted }}>{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}</div>
                <Btn variant="ochre" size="sm" onClick={() => setShowAddProp(true)}><Plus size={15}/> Add Property</Btn>
              </div>
              {properties.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
                  <Building2 size={48} color={C.border} style={{ margin: '0 auto 12px' }}/>
                  <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>No properties yet</div>
                  <div style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Add your first property to get started</div>
                  <Btn variant="primary" onClick={() => setShowAddProp(true)}><Plus size={15}/> Add Property</Btn>
                </div>
              )}
              {properties.map((p: any) => {
                const pTenants = tenants.filter((t: any) => t.property_id === p.id)
                const pAlerts = alerts.filter((a: any) => a.property_id === p.id && !a.is_read)
                const pMsgs = messages.filter((m: any) => m.property_id === p.id && m.receiver_id === userId && !m.is_read)
                const pPayPending = payments.filter((pay: any) => { const t = tenants.find((t: any) => t.tenant_id === pay.tenant_id && t.property_id === p.id); return t && pay.status === 'pending' })
                return (
                  <button key={p.id} onClick={() => { setSelectedProp(p); setPropDetailTab('tenants') }} style={{ width: '100%', background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: 18, marginBottom: 12, cursor: 'pointer', textAlign: 'left' as const, display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: C.charcoal }}>{PROP_TYPES.find(t => t.value === p.type)?.icon} {p.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.muted, fontSize: 13, marginTop: 4 }}><MapPin size={12}/>{p.location}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <ChevronRight size={18} color={C.muted}/>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {pAlerts.length > 0 && <span style={{ background: C.red + '15', color: C.red, borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>{pAlerts.length} alert{pAlerts.length !== 1 ? 's' : ''}</span>}
                          {pMsgs.length > 0 && <span style={{ background: C.forest + '15', color: C.forest, borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>{pMsgs.length} msg{pMsgs.length !== 1 ? 's' : ''}</span>}
                          {pPayPending.length > 0 && <span style={{ background: C.ochre + '18', color: C.ochre, borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>{pPayPending.length} pending</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 0, background: C.canvas, borderRadius: 10, overflow: 'hidden' }}>
                      {[{ l: 'Units', v: p.total_units, c: C.forest }, { l: 'Tenants', v: pTenants.length, c: C.ochre }, { l: 'Vacant', v: p.total_units - pTenants.length, c: p.total_units - pTenants.length > 0 ? C.red : C.muted }].map((s, i) => (
                        <div key={s.l} style={{ flex: 1, padding: '8px 0', textAlign: 'center', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                          <div style={{ fontWeight: 900, fontSize: 18, color: s.c }}>{s.v}</div>
                          <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </button>
                )
              })}

              {/* Summary cards */}
              {properties.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                  {[
                    { label: 'Total Collected', value: formatUGX(totalCollected), color: C.green, icon: <CheckCircle size={16}/> },
                    { label: 'Expected', value: formatUGX(totalExpected), color: C.forest, icon: <CreditCard size={16}/> },
                  ].map(s => (
                    <div key={s.label} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 14 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: s.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontWeight: 900, fontSize: 14, color: C.charcoal }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'messages' && (
            <div>
              {msgThread ? (
                <div>
                  <button onClick={() => setMsgThread(null)} style={{ background: 'none', border: 'none', color: C.forest, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: 0 }}>
                    <ChevronLeft size={16}/> All Messages
                  </button>
                  <div style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 12 }}>{msgThread.other_name}</div>
                  <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ padding: 16, maxHeight: 400, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {msgThread.msgs.map((m: any) => {
                        const isMine = m.sender_id === userId
                        return (
                          <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                            <div style={{ maxWidth: '75%', background: isMine ? C.forest : C.canvas, color: isMine ? C.white : C.charcoal, borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', fontSize: 14, lineHeight: 1.5 }}>
                              {m.content}
                              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={msgReply} onChange={e => setMsgReply(e.target.value)} placeholder="Type a reply..." onKeyDown={e => e.key === 'Enter' && sendReply()}
                      style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: C.white }} />
                    <button onClick={sendReply} disabled={!msgReply.trim() || sendingMsg} style={{ background: C.forest, border: 'none', borderRadius: 12, padding: '12px 18px', color: C.white, cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: !msgReply.trim() ? 0.5 : 1 }}>Send</button>
                  </div>
                </div>
              ) : (
                <div>
                  {allThreads.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: C.muted, background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}><MessageSquare size={40} color={C.border} style={{ margin: '0 auto 12px' }}/><div>No messages yet.</div><div style={{ fontSize: 13, marginTop: 6 }}>Tenants can message you from their portals.</div></div>}
                  {allThreads.map((th: any, i: number) => (
                    <button key={i} onClick={() => setMsgThread(th)} style={{ width: '100%', background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, borderLeft: th.unread > 0 ? `3px solid ${C.forest}` : `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' as const }}>
                      <div>
                        <div style={{ fontWeight: th.unread > 0 ? 800 : 700, color: C.charcoal }}>{th.other_name || 'Tenant'}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{th.msgs[th.msgs.length - 1]?.content?.slice(0, 55)}{(th.msgs[th.msgs.length - 1]?.content?.length || 0) > 55 ? '...' : ''}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        {th.unread > 0 && <span style={{ background: C.red, color: C.white, borderRadius: 10, minWidth: 20, height: 20, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{th.unread}</span>}
                        <ChevronRight size={16} color={C.muted}/>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LISTINGS */}
          {tab === 'listings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: C.muted }}>{listings.length} listing{listings.length !== 1 ? 's' : ''}</div>
                <Btn variant="ochre" size="sm" onClick={() => setShowAddListing(true)}><Plus size={15}/> Add Listing</Btn>
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

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div>
              <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={16}/> Change Password</div>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <input type={showNewPass ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
                  <button onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>
                    {showNewPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <button onClick={changeLandlordPassword} disabled={saving || newPassword.length < 6}
                  style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 12, background: newPassword.length >= 6 ? C.ochre : C.border, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: newPassword.length < 6 ? 0.6 : 1 }}>
                  Update Password
                </button>
              </div>

              <button onClick={signOut}
                style={{ width: '100%', padding: '14px', border: `1px solid ${C.red}30`, borderRadius: 16, background: C.red + '08', color: C.red, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <LogOut size={18}/> Sign Out
              </button>

              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 16, background: 'transparent', color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                  Delete my account
                </button>
              ) : (
                <div style={{ background: '#FFF5F5', border: `1px solid ${C.red}30`, borderRadius: 16, padding: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.red, marginBottom: 6 }}>⚠️ Delete Account</div>
                  <div style={{ fontSize: 13, color: C.body, lineHeight: 1.6, marginBottom: 16 }}>
                    This permanently deletes your account, all properties, tenancies, and data. Cannot be undone. Type <strong>DELETE</strong> to confirm.
                  </div>
                  <input placeholder="Type DELETE to confirm" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.red}50`, fontSize: 14, outline: 'none', background: C.white, marginBottom: 12, boxSizing: 'border-box' as const }}/>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                      style={{ flex: 1, padding: '11px', border: `1px solid ${C.border}`, borderRadius: 10, background: C.white, color: C.muted, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                    <button onClick={deleteLandlordAccount} disabled={deleteConfirmText !== 'DELETE' || saving}
                      style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 10, background: deleteConfirmText === 'DELETE' ? C.red : C.border, color: C.white, fontWeight: 700, cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed', fontSize: 14 }}>
                      {saving ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100 }} className="bottom-nav">
          {NAV.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)} style={{ flex: 1, padding: '10px 2px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: tab === n.key ? C.forest : C.muted, position: 'relative' }}>
              {(n.badge ?? 0) > 0 && <div style={{ position: 'absolute', top: 6, right: '50%', transform: 'translateX(10px)', background: C.red, color: C.white, borderRadius: 20, minWidth: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.badge}</div>}
              <div style={{ transform: tab === n.key ? 'scale(1.1)' : 'scale(1)' }}>{n.icon}</div>
              <div style={{ fontSize: 9, fontWeight: tab === n.key ? 700 : 500 }}>{n.label}</div>
              {tab === n.key && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, background: C.forest, borderRadius: '0 0 4px 4px' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Modals (main portal) */}
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
          <div style={{ fontSize: 12, color: C.body, lineHeight: 1.6 }}>After adding your property, share the invite code with tenants to let them join.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="ghost" onClick={() => setShowAddProp(false)} full>Cancel</Btn>
          <Btn variant="primary" onClick={addProperty} full disabled={saving}>{saving ? 'Saving...' : 'Add Property'}</Btn>
        </div>
      </Modal>

      <Modal open={showAddListing} onClose={() => setShowAddListing(false)} title="Add Listing">
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
                <ImageIcon size={20}/><span style={{ fontSize: 10, marginTop: 4 }}>Add</span>
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
          <textarea placeholder="Describe the property..." value={newListing.description} onChange={e => setNewListing(l => ({ ...l, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const, fontFamily: 'inherit', resize: 'none' as const }} />
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

      <Modal open={!!showCode} onClose={() => setShowCode(null)} title={showCodeLabel || 'Invite Code'}>
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 900, letterSpacing: 10, color: C.forest }}>{showCode}</div>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>Share this with your tenant so they can join your property.</p>
          <Btn variant="primary" onClick={() => { navigator.clipboard?.writeText(showCode || ''); showToast('Copied!'); setShowCode(null) }} full><Copy size={16}/> Copy Code</Btn>
        </div>
      </Modal>

      <Toast msg={toast.msg} visible={toast.show}/>
    </div>
  )
}
