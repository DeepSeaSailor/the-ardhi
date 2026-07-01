'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, clearSession } from '@/lib/session'
import Logo from '@/components/Logo'
import {
  Building2, MessageCircle, Settings, MapPin, Star,
  CreditCard, CheckCircle, AlertTriangle, X, Send, Upload, FileCheck,
  LogOut, Eye, EyeOff, Lock, ArrowLeft, Download,
  ChevronRight, Smartphone, Landmark, Clock, Plus,
  Wifi, Shield, Car, Zap, Droplets, Tv, Wind,
  Waves, Dumbbell, Trees, Utensils, Sun, Flame, Dog, Camera
} from 'lucide-react'

const C = {
  forest: '#1B3A2D', forestLight: '#2A5240', ochre: '#C8922A',
  canvas: '#F9F6F1', charcoal: '#1A1A1A', body: '#3D3D3D',
  mint: '#EBF4EF', red: '#D64045', border: '#E8E4DC',
  muted: '#8A8A82', white: '#FFFFFF', green: '#2A7D4F'
}

const AMENITY_ICONS: Record<string, any> = {
  'WiFi': <Wifi size={13}/>, 'Security Guard': <Shield size={13}/>,
  'CCTV': <Shield size={13}/>, 'Parking': <Car size={13}/>,
  'Generator': <Zap size={13}/>, 'Borehole Water': <Droplets size={13}/>,
  'Piped Water': <Droplets size={13}/>, 'DSTV': <Tv size={13}/>,
  'Air Conditioning': <Wind size={13}/>, 'Swimming Pool': <Waves size={13}/>,
  'Gym': <Dumbbell size={13}/>, 'Garden': <Trees size={13}/>,
  'Furnished': <Star size={13}/>, 'Kitchen': <Utensils size={13}/>,
  'Solar Power': <Sun size={13}/>, 'Gas Cooking': <Flame size={13}/>,
  'Pet Friendly': <Dog size={13}/>,
}

function formatUGX(n: number) { return 'UGX ' + (n || 0).toLocaleString('en-UG') }

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: C.white, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: C.white, padding: 'calc(20px + env(safe-area-inset-top, 0px)) 24px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: C.charcoal, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#F5F5F3', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted }}><X size={16}/></button>
        </div>
        <div style={{ padding: '20px 24px 48px' }}>{children}</div>
      </div>
    </div>
  )
}

function Toast({ msg, visible }: any) {
  if (!visible) return null
  return (
    <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: C.charcoal, color: C.white, padding: '12px 20px', borderRadius: 40, fontWeight: 600, fontSize: 13, zIndex: 2000, whiteSpace: 'nowrap' as const, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <CheckCircle size={15}/>{msg}
    </div>
  )
}

function StarRating({ value, onChange, readonly = false }: any) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => !readonly && onChange && onChange(n)}
          style={{ background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer', padding: 2 }}>
          <Star size={readonly ? 16 : 28} fill={n <= value ? C.ochre : 'none'} color={n <= value ? C.ochre : C.border} strokeWidth={1.5}/>
        </button>
      ))}
    </div>
  )
}

function Label({ children }: any) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>{children}</label>
}

export default function TenantDashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState('properties')
  const [profile, setProfile] = useState<any>(null)
  const [tenancies, setTenancies] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openProp, setOpenProp] = useState<any>(null)
  const [toast, setToast] = useState({ show: false, msg: '' })

  const [showPay, setShowPay] = useState(false)
  const [showLinkProp, setShowLinkProp] = useState(false)

  const [payMethod, setPayMethod] = useState('mtn_momo')
  const [payPhone, setPayPhone] = useState('')
  const [payRef, setPayRef] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [linkStep, setLinkStep] = useState<'code'|'pick-unit'>('code')
  const [linkProperty, setLinkProperty] = useState<any>(null)
  const [linkUnits, setLinkUnits] = useState<any[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [msgText, setMsgText] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [saving, setSaving] = useState(false)

  const showToast = (msg: string) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: '' }), 2500) }

  useEffect(() => {
    const session = getSession()
    if (!session) { router.push('/'); return }
    setUserId(session.id)
  }, [router])

  const apiFetch = useCallback((url: string, opts: RequestInit = {}) => {
    return fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '', ...(opts.headers || {}) } })
  }, [userId])

  const fetchData = useCallback(async () => {
    if (!userId) return
    try {
      const [pRes, tRes, payRes, mRes, cRes] = await Promise.all([
        apiFetch('/api/tenant/profile'),
        apiFetch('/api/tenant/tenancies'),
        apiFetch('/api/tenant/payments'),
        apiFetch('/api/tenant/messages'),
        apiFetch('/api/tenant/complaints'),
      ])
      const [p, t, pay, m, c] = await Promise.all([pRes.json(), tRes.json(), payRes.json(), mRes.json(), cRes.json()])
      if (p.data) { setProfile(p.data); setEditName(p.data.full_name || ''); setEditPhone(p.data.phone || '') }
      setTenancies(t.data || [])
      setPayments(pay.data || [])
      setMessages(m.data || [])
      setMyComplaints(c.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [userId, apiFetch])

  useEffect(() => { if (userId) fetchData() }, [userId, fetchData])

  const firstName = profile?.full_name?.split(' ')[0] || 'Tenant'
  const myMessages = messages.filter((m: any) => m.sender_id === userId || m.receiver_id === userId)
  const unreadMessages = myMessages.filter((m: any) => !m.is_read && m.receiver_id === userId).length

  function isRentPaid(tenancy: any) {
    if (!tenancy) return false
    return payments.some((p: any) => {
      const d = new Date(p.created_at); const now = new Date()
      return p.status === 'confirmed' && p.tenancy_id === tenancy.id &&
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  }

  async function submitPayment() {
    if (!payRef) { showToast('Enter payment reference'); return }
    setSaving(true)
    try {
      const res = await apiFetch('/api/tenant/payments', { method: 'POST', body: JSON.stringify({ amount: openProp?.rent_amount, payment_method: payMethod, reference: payRef, phone_or_account: payPhone, tenancy_id: openProp?.id }) })
      if (res.ok) { showToast('Payment submitted'); setShowPay(false); setPayRef(''); fetchData() }
    } finally { setSaving(false) }
  }

  async function submitReview() {
    if (!reviewRating) { showToast('Select a rating'); return }
    setSaving(true)
    try {
      const res = await apiFetch('/api/tenant/reviews', { method: 'POST', body: JSON.stringify({ property_id: openProp?.property_id, rating: reviewRating, comment: reviewComment }) })
      if (res.ok) { showToast('Review submitted!'); setReviewRating(0); setReviewComment('') }
    } finally { setSaving(false) }
  }

  async function validateCode() {
    if (!inviteCode.trim()) return
    setSaving(true)
    try {
      const res = await apiFetch('/api/tenant/validate-code', {
        method: 'POST',
        body: JSON.stringify({ invite_code: inviteCode.toUpperCase().trim() })
      })
      const d = await res.json()
      if (!res.ok) { showToast(d.error || 'Invalid code'); return }

      setLinkProperty(d.property)
      setLinkUnits(d.units || [])

      if (d.isUnitSpecific) {
        // Unit-specific code — link immediately, no picker needed
        await doLink(inviteCode.toUpperCase().trim())
      } else if ((d.units || []).length <= 1) {
        // Only one unit or none — link immediately
        await doLink(inviteCode.toUpperCase().trim())
      } else {
        // Generic code + multiple units — show unit picker
        setSelectedUnit('')
        setLinkStep('pick-unit')
      }
    } finally { setSaving(false) }
  }

  async function doLink(code: string) {
    const res = await apiFetch('/api/tenant/link-property', {
      method: 'POST',
      body: JSON.stringify({ invite_code: code })
    })
    const d = await res.json()
    if (res.ok) {
      showToast('Property linked!')
      setShowLinkProp(false)
      setInviteCode('')
      setLinkStep('code')
      setLinkProperty(null)
      setLinkUnits([])
      setTimeout(() => fetchData(), 800)
    } else {
      showToast(d.error || 'Linking failed')
    }
  }

  async function confirmUnitSelection() {
    if (!selectedUnit) return
    setSaving(true)
    try {
      // Pass unit-specific code: baseCode + -U + unitNumber
      const baseCode = inviteCode.toUpperCase().trim()
      const unitCode = baseCode + '-U' + selectedUnit
      await doLink(unitCode)
    } finally {
      setSaving(false)
    }
  }

  async function sendMessage() {
    if (!msgText.trim()) return
    setSaving(true)
    try {
      const landlordId = tenancies[0]?.landlord_id
      if (!landlordId) { showToast('No landlord linked'); setSaving(false); return }
      const res = await apiFetch('/api/tenant/messages', { method: 'POST', body: JSON.stringify({ receiver_id: landlordId, content: msgText, property_id: tenancies[0]?.property_id }) })
      if (res.ok) { setMsgText(''); fetchData() }
    } finally { setSaving(false) }
  }

  async function saveProfile() {
    setSaving(true)
    try {
      await apiFetch('/api/tenant/profile', { method: 'PATCH', body: JSON.stringify({ full_name: editName, phone: editPhone }) })
      showToast('Profile updated'); fetchData()
    } finally { setSaving(false) }
  }

  async function changePassword() {
    if (newPassword.length < 6) { showToast('Min 6 characters'); return }
    setSaving(true)
    try {
      const res = await apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ password: newPassword }) })
      if (res.ok) { showToast('Password updated'); setNewPassword('') }
      else showToast('Failed — try again')
    } finally { setSaving(false) }
  }

  async function deleteAccount() {
    setSaving(true)
    try {
      const res = await apiFetch('/api/auth/delete-account', { method: 'DELETE' })
      if (res.ok) { clearSession(); router.push('/') }
      else showToast('Failed to delete account')
    } finally { setSaving(false) }
  }

  const [uploadingId, setUploadingId] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [complaintText, setComplaintText] = useState('')
  const [complaintPhoto, setComplaintPhoto] = useState<{ base64: string, name: string } | null>(null)
  const [submittingComplaint, setSubmittingComplaint] = useState(false)
  const [myComplaints, setMyComplaints] = useState<any[]>([])

  async function uploadIdDoc(file: File) {
    setUploadingId(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const res = await apiFetch('/api/tenant/upload-id', {
          method: 'POST',
          body: JSON.stringify({ doc_base64: base64, doc_name: file.name })
        })
        if (res.ok) { showToast('ID uploaded — under review'); fetchData() }
        else showToast('Upload failed')
        setUploadingId(false)
      }
      reader.readAsDataURL(file)
    } catch { showToast('Upload failed'); setUploadingId(false) }
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const res = await apiFetch('/api/profile/avatar', {
          method: 'POST',
          body: JSON.stringify({ image_base64: base64, file_name: file.name })
        })
        const d = await res.json()
        if (res.ok) {
          setProfile((p: any) => ({ ...p, avatar_url: d.url }))
          showToast('Profile photo updated')
        } else {
          showToast(d.error || 'Upload failed')
        }
        setUploadingAvatar(false)
      }
      reader.readAsDataURL(file)
    } catch { showToast('Upload failed'); setUploadingAvatar(false) }
  }

  const NAV = [
    { key: 'properties', icon: <Building2 size={21}/>, label: 'Properties' },
    { key: 'messages', icon: <MessageCircle size={21}/>, label: 'Messages', badge: unreadMessages },
    { key: 'settings', icon: <Settings size={21}/>, label: 'Settings' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, flexDirection: 'column', gap: 12 }}>
      <Logo size={48}/><div style={{ color: C.muted, fontSize: 14 }}>Loading...</div>
    </div>
  )

  // ── PROPERTY DETAIL VIEW ────────────────────────────────────────────────────
  if (openProp) {
    const paid = isRentPaid(openProp)
    const propPayments = payments.filter((p: any) => p.tenancy_id === openProp.id)
    const propMessages = myMessages.filter((m: any) => m.property_id === openProp.property_id)
    return (
      <div style={{ minHeight: '100vh', background: C.canvas }}>
        {/* Desktop sidebar placeholder */}
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar (desktop) */}
          <div className="sidebar" style={{ display: 'none', flexDirection: 'column', background: C.forest, width: 240, position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 200, padding: '28px 0', overflowY: 'auto' }}>
            <div style={{ padding: '0 20px 24px', borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
              <Logo size={32}/>
              <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tenant Portal</div>
            </div>
            <div style={{ padding: '16px 12px', flex: 1 }}>
              {NAV.map(n => (
                <button key={n.key} onClick={() => { setOpenProp(null); setTab(n.key) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 4, fontWeight: 500, fontSize: 13, textAlign: 'left' as const }}>
                  {n.icon} {n.label}
                </button>
              ))}
            </div>
          </div>
          {/* Main */}
          <div className="main-content" style={{ flex: 1, paddingBottom: 80 }}>
            <div style={{ background: `linear-gradient(160deg, ${C.forest} 0%, ${C.forestLight} 100%)`, padding: 'calc(20px + env(safe-area-inset-top, 0px)) 20px 28px', position: 'sticky', top: 0, zIndex: 100 }}>
              <button onClick={() => setOpenProp(null)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10, padding: '8px 14px', color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
                <ArrowLeft size={14}/> My Properties
              </button>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Your Rental</div>
              <div style={{ color: C.white, fontWeight: 900, fontSize: 22, letterSpacing: '-0.3px' }}>{openProp.property_name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12}/>{openProp.property_location} · Unit {openProp.unit_number}
              </div>
            </div>

            <div style={{ padding: '20px 16px', maxWidth: 720, margin: '0 auto' }}>
              {/* Desktop 2-col layout */}
              <style>{`
                @media (min-width: 900px) {
                  .prop-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                  .prop-detail-full { grid-column: 1 / -1; }
                }
              `}</style>
              <div className="prop-detail-grid">

                {/* Rent card */}
                <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Monthly Rent</div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: C.charcoal, letterSpacing: '-0.5px', lineHeight: 1 }}>{formatUGX(openProp.rent_amount)}</div>
                    </div>
                    <div style={{ background: paid ? C.green + '15' : C.red + '12', border: `1px solid ${paid ? C.green : C.red}30`, borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {paid ? <CheckCircle size={14} color={C.green}/> : <Clock size={14} color={C.red}/>}
                      <span style={{ fontSize: 13, fontWeight: 700, color: paid ? C.green : C.red }}>{paid ? 'Paid' : 'Due'}</span>
                    </div>
                  </div>
                  {!paid ? (
                    <button onClick={() => setShowPay(true)} style={{ width: '100%', padding: '13px', border: 'none', borderRadius: 12, background: C.ochre, color: C.white, fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <CreditCard size={17}/> Pay Rent Now
                    </button>
                  ) : (
                    <div style={{ background: C.mint, borderRadius: 10, padding: '10px 14px', textAlign: 'center', color: C.green, fontWeight: 700, fontSize: 14 }}>✓ Rent paid this month</div>
                  )}
                </div>

                {/* Property details */}
                <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.charcoal, marginBottom: 14 }}>Property Details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {[
                      { l: 'Type', v: openProp.property_type || 'Residential' },
                      { l: 'Unit', v: openProp.unit_number },
                      { l: 'Lease Start', v: openProp.start_date ? new Date(openProp.start_date).toLocaleDateString('en-UG') : '—' },
                      { l: 'Status', v: openProp.is_active ? 'Active' : 'Inactive' },
                    ].map(r => (
                      <div key={r.l} style={{ background: C.canvas, borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{r.l}</div>
                        <div style={{ fontWeight: 700, color: C.charcoal, fontSize: 13, textTransform: 'capitalize' as const }}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                  {openProp.amenities?.length > 0 && (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Amenities</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {openProp.amenities.map((a: string) => (
                          <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.mint, borderRadius: 8, padding: '5px 9px', color: C.forest, fontSize: 11, fontWeight: 600 }}>
                            {AMENITY_ICONS[a] || <Shield size={11}/>} {a}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Payment history */}
                <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.charcoal }}>Payment History</div>
                    <button onClick={async () => {
                      const { downloadAgreementPDF } = await import('@/components/TenancyPDF')
                      await downloadAgreementPDF({ tenantName: profile?.full_name || 'Tenant', nationalId: profile?.national_id || 'N/A', phone: profile?.phone || 'N/A', email: profile?.email || 'N/A', landlordName: 'Landlord', propertyName: openProp.property_name || 'N/A', location: openProp.property_location || 'Uganda', unitNumber: openProp.unit_number || 'N/A', rentAmount: openProp.rent_amount || 0, depositAmount: 0, startDate: openProp.start_date || new Date().toLocaleDateString(), signedAt: new Date().toLocaleString() })
                    }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: C.muted, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      <Download size={12}/> Agreement
                    </button>
                  </div>
                  {propPayments.length === 0 && <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: 16 }}>No payments yet.</div>}
                  {propPayments.map((p: any, i: number) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < propPayments.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: C.charcoal, fontSize: 14 }}>{formatUGX(p.amount)}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{p.payment_method?.replace(/_/g, ' ')} · {new Date(p.created_at).toLocaleDateString('en-UG')}</div>
                      </div>
                      <span style={{ background: (p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre) + '15', color: p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>{p.status}</span>
                    </div>
                  ))}
                </div>

                {/* Rate */}
                <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.charcoal, marginBottom: 4 }}>Rate This Property</div>
                  <div style={{ color: C.muted, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>Help future tenants with your experience.</div>
                  <StarRating value={reviewRating} onChange={setReviewRating}/>
                  {reviewRating > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <textarea placeholder="Add a comment (optional)..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'none' as const, boxSizing: 'border-box' as const, marginBottom: 10 }}/>
                      <button onClick={submitReview} disabled={saving} style={{ padding: '10px 22px', border: 'none', borderRadius: 10, background: C.ochre, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Submit Review</button>
                    </div>
                  )}
                </div>

              </div>{/* end grid */}
            </div>

            {/* Bottom nav mobile */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }} className="bottom-nav">
              {NAV.map(n => (
                <button key={n.key} onClick={() => { setOpenProp(null); setTab(n.key) }}
                  style={{ flex: 1, padding: '12px 2px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: C.muted }}>
                  {n.icon}
                  <div style={{ fontSize: 10, fontWeight: 500 }}>{n.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Modal open={showPay} onClose={() => setShowPay(false)} title="Pay Rent">
          <div style={{ background: C.mint, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: C.forest }}>Amount due</div>
            <div style={{ fontWeight: 800, color: C.forest }}>{formatUGX(openProp?.rent_amount)}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <Label>Payment Method</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[{ v: 'mtn_momo', l: 'MTN MoMo', icon: <Smartphone size={15}/> }, { v: 'airtel_money', l: 'Airtel', icon: <Smartphone size={15}/> }, { v: 'bank', l: 'Bank', icon: <Landmark size={15}/> }].map(m => (
                <button key={m.v} onClick={() => setPayMethod(m.v)} style={{ padding: '10px 6px', border: `2px solid ${payMethod === m.v ? C.forest : C.border}`, borderRadius: 10, background: payMethod === m.v ? C.mint : C.white, color: payMethod === m.v ? C.forest : C.muted, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11 }}>
                  {m.icon}{m.l}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Label>Your Phone / Account</Label>
            <input placeholder="0772 000 001" value={payPhone} onChange={e => setPayPhone(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <Label>Transaction Reference</Label>
            <input placeholder="e.g. 1234567890" value={payRef} onChange={e => setPayRef(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}/>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Pay via MoMo first, then enter the transaction ID here.</div>
          </div>
          <button onClick={submitPayment} disabled={saving || !payRef} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: payRef ? C.forest : C.muted, color: C.white, fontWeight: 700, fontSize: 15, cursor: payRef ? 'pointer' : 'not-allowed' }}>
            {saving ? 'Submitting...' : 'Submit Payment'}
          </button>
        </Modal>

        <Toast msg={toast.msg} visible={toast.show}/>
      </div>
    )
  }

  // ── MAIN DASHBOARD ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.canvas }} className="app-shell">
      {/* Desktop Sidebar */}
      <div className="sidebar" style={{ display: 'none', flexDirection: 'column', background: C.forest, position: 'fixed', top: 0, bottom: 0, left: 0, width: 240, zIndex: 200, padding: '28px 0', overflowY: 'auto' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
          <Logo size={32}/>
          <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tenant Portal</div>
        </div>
        <div style={{ padding: '16px 12px', flex: 1 }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', borderRadius: 10, background: tab === n.key ? 'rgba(255,255,255,0.12)' : 'transparent', color: tab === n.key ? C.white : 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: 4, fontWeight: tab === n.key ? 700 : 500, fontSize: 13, textAlign: 'left' as const, borderLeft: tab === n.key ? `2px solid ${C.ochre}` : '2px solid transparent' }}>
              {n.icon} {n.label}
              {(n.badge ?? 0) > 0 && <span style={{ marginLeft: 'auto', background: C.red, color: C.white, borderRadius: 10, minWidth: 18, height: 18, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{n.badge}</span>}
            </button>
          ))}
        </div>
        <div style={{ padding: '16px 20px', borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setTab('settings')} style={{ width: 36, height: 36, borderRadius: '50%', background: C.ochre, border: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, flexShrink: 0 }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : firstName[0]}
            </button>
            <div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>{profile?.full_name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Tenant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content" style={{ flex: 1, paddingBottom: 80, minHeight: '100vh', width: '100%', minWidth: 0 }}>
        {/* Sticky header */}
        <div style={{ background: `linear-gradient(160deg, ${C.forest} 0%, ${C.forestLight} 100%)`, padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Logo size={30}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {unreadMessages > 0 && (
                <div style={{ background: C.red, color: C.white, borderRadius: 20, minWidth: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, padding: '0 6px' }}>{unreadMessages}</div>
              )}
              <button onClick={() => setTab('settings')} style={{ width: 36, height: 36, borderRadius: '50%', background: C.ochre, border: 'none', padding: 0, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : firstName[0]}
            </button>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {tab === 'properties' ? 'My Rentals' : tab === 'messages' ? 'Inbox' : 'Account'}
            </div>
            <div style={{ color: C.white, fontWeight: 900, fontSize: 20, marginTop: 2, letterSpacing: '-0.3px' }}>
              {tab === 'properties' ? firstName : tab === 'messages' ? 'Messages' : 'Settings'}
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 28px', maxWidth: 960, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const }}>

          {/* PROPERTIES */}
          {tab === 'properties' && (
            <div>
              {tenancies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '56px 24px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
                  <Building2 size={52} color={C.border} style={{ margin: '0 auto 16px' }}/>
                  <div style={{ fontWeight: 800, fontSize: 18, color: C.charcoal, marginBottom: 8 }}>No properties linked yet</div>
                  <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
                    Ask your landlord for an invite code, then tap below to link your rental.
                  </div>
                  <button onClick={() => setShowLinkProp(true)} style={{ background: C.forest, border: 'none', borderRadius: 12, padding: '13px 28px', color: C.white, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={17}/> Link a Property
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop 2-col card grid */}
                  <style>{`@media (min-width: 900px) { .tenancy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; } }`}</style>
                  <div className="tenancy-grid">
                    {tenancies.map((t: any) => {
                      const paid = isRentPaid(t)
                      return (
                        <div key={t.id} onClick={() => setOpenProp(t)} style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, borderLeft: `4px solid ${paid ? C.green : C.ochre}`, padding: 18, cursor: 'pointer', marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: 16, color: C.charcoal }}>{t.property_name}</div>
                              <div style={{ fontSize: 12, color: C.muted, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11}/>{t.property_location}</div>
                              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Unit {t.unit_number} · {t.property_type || 'Residential'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                              <div style={{ background: paid ? C.green + '15' : C.red + '12', border: `1px solid ${paid ? C.green : C.red}25`, borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: paid ? C.green : C.red }}>
                                {paid ? '✓ Paid' : 'Due'}
                              </div>
                              <ChevronRight size={16} color={C.muted}/>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 900, fontSize: 19, color: C.forest }}>{formatUGX(t.rent_amount)}<span style={{ fontSize: 12, fontWeight: 400, color: C.muted }}>/mo</span></div>
                            {t.amenities?.length > 0 && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                {t.amenities.slice(0, 3).map((a: string) => (
                                  <div key={a} style={{ background: C.mint, borderRadius: 6, padding: '3px 7px', fontSize: 10, color: C.forest, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                                    {AMENITY_ICONS[a] || <Shield size={10}/>}
                                  </div>
                                ))}
                                {t.amenities.length > 3 && <div style={{ background: C.canvas, borderRadius: 6, padding: '3px 7px', fontSize: 10, color: C.muted }}>+{t.amenities.length - 3}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => setShowLinkProp(true)} style={{ width: '100%', padding: '13px', border: `1.5px dashed ${C.border}`, borderRadius: 16, background: 'transparent', color: C.forest, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                    <Plus size={16}/> Link another property
                  </button>
                </>
              )}
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'messages' && (
            <div>
              {tenancies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: C.muted, background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
                  Link a property first to message your landlord.
                </div>
              ) : (
                <>
                  <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, maxHeight: 480, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                    {myMessages.length === 0 && <div style={{ textAlign: 'center', color: C.muted, fontSize: 14, padding: 32 }}>No messages yet. Say hello!</div>}
                    {myMessages.map((m: any) => {
                      const isMine = m.sender_id === userId
                      return (
                        <div key={m.id} style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: isMine ? C.ochre : C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: isMine ? C.white : C.forest, flexShrink: 0 }}>{isMine ? firstName[0] : 'L'}</div>
                          <div style={{ maxWidth: '72%', background: isMine ? C.forest : C.white, border: isMine ? 'none' : `1px solid ${C.border}`, borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px' }}>
                            <div style={{ fontSize: 14, color: isMine ? C.white : C.charcoal, lineHeight: 1.5 }}>{m.content}</div>
                            <div style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.45)' : C.muted, marginTop: 4 }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Message your landlord..." style={{ flex: 1, padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: C.white }}/>
                    <button onClick={sendMessage} disabled={!msgText.trim()} style={{ background: C.forest, border: 'none', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.white, flexShrink: 0, opacity: !msgText.trim() ? 0.5 : 1 }}><Send size={18}/></button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div>
              <style>{`@media (min-width: 900px) { .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } }`}</style>
              <div className="settings-grid">
                {/* Profile */}
                <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 24, overflow: 'hidden' }}>
                        {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : firstName[0]}
                      </div>
                      <label style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: C.ochre, border: `2px solid ${C.white}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {uploadingAvatar ? <Clock size={11} color={C.white}/> : <Camera size={11} color={C.white}/>}
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }}/>
                      </label>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: C.charcoal }}>{profile?.full_name}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{profile?.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                    <div style={{ flex: 1, background: '#FAFAF8', borderRadius: 12, padding: '12px 8px', textAlign: 'center' as const }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: C.forest }}>{tenancies.length}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{tenancies.length === 1 ? 'Property' : 'Properties'} Rented</div>
                    </div>
                    <div style={{ flex: 1, background: '#FAFAF8', borderRadius: 12, padding: '12px 8px', textAlign: 'center' as const }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: C.ochre }}>{payments.filter((p:any) => p.status === 'confirmed').length}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Payments Made</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Label>Full Name</Label>
                    <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Label>Phone</Label>
                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
                  </div>
                  <button onClick={saveProfile} disabled={saving} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 12, background: C.forest, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Save Changes</button>
                </div>

                {/* National ID verification */}
                <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.charcoal, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><FileCheck size={15}/> National ID Verification</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>Upload a photo of your national ID or passport to verify your identity.</div>
                  {(!profile?.id_status || profile?.id_status === 'none') && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.canvas, border: `1.5px dashed ${C.border}`, borderRadius: 12, padding: '12px 16px', cursor: 'pointer', color: C.muted, fontSize: 14, fontWeight: 600 }}>
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }}
                        onChange={e => { if (e.target.files?.[0]) uploadIdDoc(e.target.files[0]) }}/>
                      <Upload size={16}/>
                      {uploadingId ? 'Uploading...' : 'Upload National ID / Passport'}
                    </label>
                  )}
                  {profile?.id_status === 'under_review' && (
                    <div style={{ background: '#FFF8EC', border: `1px solid ${C.ochre}30`, borderRadius: 12, padding: '12px 16px', fontSize: 14, color: C.ochre, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      ⏳ Under Review — admin is verifying your ID
                    </div>
                  )}
                  {profile?.id_status === 'verified' && (
                    <div style={{ background: C.mint, border: `1px solid ${C.green}30`, borderRadius: 12, padding: '12px 16px', fontSize: 14, color: C.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={16}/> Identity Verified
                    </div>
                  )}
                  {profile?.id_status === 'rejected' && (
                    <div>
                      <div style={{ background: C.red + '10', border: `1px solid ${C.red}30`, borderRadius: 12, padding: '12px 16px', fontSize: 14, color: C.red, fontWeight: 700, marginBottom: 10 }}>
                        ✗ ID Rejected — please upload a clearer copy
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.canvas, border: `1.5px dashed ${C.border}`, borderRadius: 12, padding: '12px 16px', cursor: 'pointer', color: C.muted, fontSize: 14, fontWeight: 600 }}>
                        <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }}
                          onChange={e => { if (e.target.files?.[0]) uploadIdDoc(e.target.files[0]) }}/>
                        <Upload size={16}/> Re-upload ID
                      </label>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.charcoal, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={15}/> Change Password</div>
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <input type={showNewPass ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
                    <button onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>
                      {showNewPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <button onClick={changePassword} disabled={saving || newPassword.length < 6}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 12, background: newPassword.length >= 6 ? C.ochre : C.border, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: newPassword.length < 6 ? 0.6 : 1 }}>
                    Update Password
                  </button>
                </div>

                {/* Sign out + delete - full width */}
                <div style={{ gridColumn: '1 / -1' } as any}>
                  <button onClick={() => { clearSession(); router.push('/') }}
                    style={{ width: '100%', padding: '14px', border: `1px solid ${C.red}30`, borderRadius: 16, background: C.red + '08', color: C.red, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                    <LogOut size={17}/> Sign Out
                  </button>
                  {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 16, background: 'transparent', color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Delete my account</button>
                  ) : (
                    <div style={{ background: '#FFF5F5', border: `1px solid ${C.red}30`, borderRadius: 16, padding: 20 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: C.red, marginBottom: 6 }}>⚠️ Delete Account</div>
                      <div style={{ fontSize: 13, color: C.body, lineHeight: 1.6, marginBottom: 14 }}>Permanently deletes everything. Type <strong>DELETE</strong> to confirm.</div>
                      <input placeholder="Type DELETE to confirm" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${C.red}50`, fontSize: 14, outline: 'none', background: C.white, marginBottom: 10, boxSizing: 'border-box' as const }}/>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }} style={{ flex: 1, padding: '11px', border: `1px solid ${C.border}`, borderRadius: 10, background: C.white, color: C.muted, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                        <button onClick={deleteAccount} disabled={deleteConfirmText !== 'DELETE' || saving}
                          style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 10, background: deleteConfirmText === 'DELETE' ? C.red : C.border, color: C.white, fontWeight: 700, cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed', fontSize: 14 }}>
                          {saving ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }} className="bottom-nav">
          {NAV.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)}
              style={{ flex: 1, padding: '12px 2px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: tab === n.key ? C.forest : C.muted, position: 'relative' }}>
              {(n.badge ?? 0) > 0 && <div style={{ position: 'absolute', top: 7, right: '50%', transform: 'translateX(12px)', background: C.red, color: C.white, borderRadius: 20, minWidth: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{n.badge}</div>}
              {n.icon}
              <div style={{ fontSize: 10, fontWeight: tab === n.key ? 700 : 400 }}>{n.label}</div>
              {tab === n.key && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2.5, background: C.forest, borderRadius: '0 0 3px 3px' }}/>}
            </button>
          ))}
        </div>
      </div>

      <Modal open={showLinkProp} onClose={() => { setShowLinkProp(false); setLinkStep('code'); setInviteCode(''); setLinkProperty(null) }}
        title={linkStep === 'pick-unit' ? 'Select Your Unit' : 'Link a Property'}>

        {linkStep === 'code' && (
          <>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              Your landlord gives you an invite code. Enter it below to link your rental.
            </p>
            <input
              placeholder="Enter invite code (e.g. ABC123)"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 20, fontWeight: 700, outline: 'none', textAlign: 'center', letterSpacing: 6, marginBottom: 16, boxSizing: 'border-box' as const, fontFamily: 'monospace' }}/>
            <button onClick={validateCode} disabled={saving || !inviteCode.trim()}
              style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: inviteCode.trim() ? C.forest : C.muted, color: C.white, fontWeight: 700, fontSize: 15, cursor: inviteCode.trim() ? 'pointer' : 'not-allowed' }}>
              {saving ? 'Checking...' : 'Continue'}
            </button>
          </>
        )}

        {linkStep === 'pick-unit' && linkProperty && (
          <>
            <div style={{ background: '#F8F9FA', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: C.charcoal, fontSize: 15 }}>{linkProperty.name}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{linkProperty.location}</div>
            </div>

            <p style={{ color: C.muted, fontSize: 14, marginBottom: 14 }}>
              Which unit are you renting? Select yours below.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20, maxHeight: 260, overflowY: 'auto' as const }}>
              {linkUnits.filter((u: any) => !u.is_occupied).map((u: any) => (
                <button key={u.id} onClick={() => setSelectedUnit(u.unit_number)}
                  style={{ padding: '16px 8px', border: `2px solid ${selectedUnit === u.unit_number ? C.forest : C.border}`, borderRadius: 12, background: selectedUnit === u.unit_number ? `${C.forest}0E` : C.white, cursor: 'pointer', textAlign: 'center' as const }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: selectedUnit === u.unit_number ? C.forest : C.charcoal }}>
                    {u.unit_number}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Unit</div>
                  {u.rent_amount > 0 && <div style={{ fontSize: 10, color: C.green, fontWeight: 600, marginTop: 2 }}>UGX {(u.rent_amount/1000).toFixed(0)}K</div>}
                </button>
              ))}
              {linkUnits.filter((u: any) => !u.is_occupied).length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center' as const, color: C.muted, padding: 24, fontSize: 13 }}>
                  No vacant units found. Contact your landlord.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setLinkStep('code')}
                style={{ flex: 1, padding: '13px', border: `1px solid ${C.border}`, borderRadius: 12, background: 'transparent', color: C.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Back
              </button>
              <button onClick={confirmUnitSelection} disabled={saving || !selectedUnit}
                style={{ flex: 2, padding: '13px', border: 'none', borderRadius: 12, background: selectedUnit ? C.forest : C.muted, color: C.white, fontWeight: 700, fontSize: 14, cursor: selectedUnit ? 'pointer' : 'not-allowed' }}>
                {saving ? 'Linking...' : `Confirm Unit ${selectedUnit}`}
              </button>
            </div>
          </>
        )}
      </Modal>

      <Toast msg={toast.msg} visible={toast.show}/>
    </div>
  )
}
