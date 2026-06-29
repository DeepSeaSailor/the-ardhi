'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, clearSession } from '@/lib/session'
import {
  Building2, MessageCircle, Settings, MapPin, Star,
  CreditCard, CheckCircle, AlertTriangle, X, Send,
  LogOut, Eye, EyeOff, Lock, Phone, Mail, User,
  Wifi, Shield, Car, Zap, Droplets, Tv, Wind,
  Waves, Dumbbell, Trees, Utensils, Sun, Flame,
  Dog, Plus, ArrowLeft, Download, ChevronRight,
  Smartphone, Landmark, Clock
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
      <div style={{ background: C.white, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: C.white, padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: C.charcoal, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#F5F5F3', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16}/></button>
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
          style={{ background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer', padding: 2, lineHeight: 1 }}>
          <Star size={readonly ? 16 : 26} fill={n <= value ? C.ochre : 'none'} color={n <= value ? C.ochre : C.border} strokeWidth={1.5}/>
        </button>
      ))}
    </div>
  )
}

export default function TenantDashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState('properties')
  const [profile, setProfile] = useState<any>(null)
  const [tenancies, setTenancies] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openProp, setOpenProp] = useState<any>(null) // selected property detail view
  const [payments, setPayments] = useState<any[]>([])
  const [toast, setToast] = useState({ show: false, msg: '' })

  // Modals
  const [showPay, setShowPay] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [showLinkProp, setShowLinkProp] = useState(false)

  // Form state
  const [payMethod, setPayMethod] = useState('mtn_momo')
  const [payPhone, setPayPhone] = useState('')
  const [payRef, setPayRef] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [inviteCode, setInviteCode] = useState('')
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
      const [pRes, tRes, payRes, mRes] = await Promise.all([
        apiFetch('/api/tenant/profile'),
        apiFetch('/api/tenant/tenancies'), // all tenancies not just one
        apiFetch('/api/tenant/payments'),
        apiFetch('/api/tenant/messages'),
      ])
      const [p, t, pay, m] = await Promise.all([pRes.json(), tRes.json(), payRes.json(), mRes.json()])
      if (p.data) { setProfile(p.data); setEditName(p.data.full_name || ''); setEditPhone(p.data.phone || '') }
      setTenancies(t.data || [])
      setPayments(pay.data || [])
      setMessages(m.data || [])
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
      if (res.ok) { showToast('Review submitted'); setShowReview(false); setReviewRating(0); setReviewComment('') }
    } finally { setSaving(false) }
  }

  async function linkProperty() {
    if (!inviteCode.trim()) return
    setSaving(true)
    try {
      const res = await apiFetch('/api/tenant/link-property', { method: 'POST', body: JSON.stringify({ invite_code: inviteCode.toUpperCase() }) })
      const d = await res.json()
      if (res.ok) { showToast('Property linked!'); setShowLinkProp(false); setInviteCode(''); fetchData() }
      else showToast(d.error || 'Invalid code')
    } finally { setSaving(false) }
  }

  async function sendMessage() {
    if (!msgText.trim()) return
    setSaving(true)
    try {
      // Find landlord from first tenancy
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

  const NAV = [
    { key: 'properties', icon: <Building2 size={22}/>, label: 'Properties' },
    { key: 'messages', icon: <MessageCircle size={22}/>, label: 'Messages', badge: unreadMessages },
    { key: 'settings', icon: <Settings size={22}/>, label: 'Settings' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, flexDirection: 'column', gap: 12 }}>
      <img src="/ardhi-logo.png" style={{ width: 64, height: 64, objectFit: 'contain' }}/>
      <div style={{ color: C.muted, fontSize: 14 }}>Loading...</div>
    </div>
  )

  // ── PROPERTY DETAIL VIEW ──
  if (openProp) {
    const paid = isRentPaid(openProp)
    const propPayments = payments.filter((p: any) => p.tenancy_id === openProp.id)
    return (
      <div style={{ minHeight: '100vh', background: C.canvas, paddingBottom: 40 }}>
        {/* Header */}
        <div style={{ background: C.forest, padding: '52px 20px 24px' }}>
          <button onClick={() => setOpenProp(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 12px', color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            <ArrowLeft size={15}/> Back
          </button>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Your Property</div>
          <div style={{ color: C.white, fontWeight: 900, fontSize: 24, letterSpacing: '-0.3px' }}>{openProp.property_name}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={13}/>{openProp.property_location}
          </div>
        </div>

        <div style={{ padding: '20px 16px', maxWidth: 560, margin: '0 auto' }}>

          {/* Status card */}
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Monthly Rent</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.charcoal, letterSpacing: '-0.5px' }}>{formatUGX(openProp.rent_amount)}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Unit {openProp.unit_number}</div>
              </div>
              <div style={{ background: paid ? C.green + '15' : C.red + '12', border: `1px solid ${paid ? C.green : C.red}30`, borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                {paid ? <CheckCircle size={15} color={C.green}/> : <Clock size={15} color={C.red}/>}
                <span style={{ fontSize: 13, fontWeight: 700, color: paid ? C.green : C.red }}>{paid ? 'Paid' : 'Due'}</span>
              </div>
            </div>
            {!paid && (
              <button onClick={() => setShowPay(true)} style={{ width: '100%', padding: '13px', border: 'none', borderRadius: 12, background: C.ochre, color: C.white, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <CreditCard size={18}/> Pay Rent Now
              </button>
            )}
            {paid && (
              <div style={{ background: C.mint, borderRadius: 10, padding: '10px 14px', textAlign: 'center', color: C.green, fontWeight: 600, fontSize: 14 }}>
                ✓ Rent paid for this month
              </div>
            )}
          </div>

          {/* Property details */}
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 14 }}>Property Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { l: 'Type', v: openProp.property_type || 'Residential' },
                { l: 'Unit', v: openProp.unit_number },
                { l: 'Lease Start', v: openProp.start_date ? new Date(openProp.start_date).toLocaleDateString('en-UG') : '—' },
                { l: 'Status', v: openProp.is_active ? 'Active' : 'Inactive' },
              ].map(r => (
                <div key={r.l} style={{ background: C.canvas, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 3 }}>{r.l}</div>
                  <div style={{ fontWeight: 700, color: C.charcoal, fontSize: 14, textTransform: 'capitalize' as const }}>{r.v}</div>
                </div>
              ))}
            </div>

            {/* Amenities */}
            {openProp.amenities?.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>Amenities</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {openProp.amenities.map((a: string) => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.mint, borderRadius: 8, padding: '6px 10px', color: C.forest, fontSize: 12, fontWeight: 600 }}>
                      {AMENITY_ICONS[a] || <Shield size={13}/>} {a}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Rating */}
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 6 }}>Rate this Property</h3>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>Help future tenants by sharing your experience.</p>
            <StarRating value={reviewRating} onChange={setReviewRating}/>
            {reviewRating > 0 && (
              <div style={{ marginTop: 12 }}>
                <textarea placeholder="Add a comment (optional)..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={3}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'none' as const, boxSizing: 'border-box' as const, marginBottom: 10 }}/>
                <button onClick={submitReview} disabled={saving} style={{ padding: '11px 24px', border: 'none', borderRadius: 10, background: C.ochre, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Submit Review</button>
              </div>
            )}
          </div>

          {/* Payment history */}
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, margin: 0 }}>Payment History</h3>
              <button onClick={async () => {
                const { downloadAgreementPDF } = await import('@/components/TenancyPDF')
                await downloadAgreementPDF({ tenantName: profile?.full_name || 'Tenant', nationalId: profile?.national_id || 'N/A', phone: profile?.phone || 'N/A', email: profile?.email || 'N/A', landlordName: 'Landlord', propertyName: openProp.property_name || 'N/A', location: openProp.property_location || 'Uganda', unitNumber: openProp.unit_number || 'N/A', rentAmount: openProp.rent_amount || 0, depositAmount: 0, startDate: openProp.start_date || new Date().toLocaleDateString(), signedAt: new Date().toLocaleString() })
              }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: C.muted, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                <Download size={13}/> Agreement
              </button>
            </div>
            {propPayments.length === 0 && <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: 20 }}>No payments yet.</div>}
            {propPayments.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.charcoal, fontSize: 14 }}>{formatUGX(p.amount)}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.payment_method?.replace(/_/g, ' ')} · {new Date(p.created_at).toLocaleDateString('en-UG')}</div>
                </div>
                <span style={{ background: (p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre) + '15', color: p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pay Modal */}
        <Modal open={showPay} onClose={() => setShowPay(false)} title="Pay Rent">
          <div style={{ background: C.mint, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: C.forest }}>Amount due</div>
            <div style={{ fontWeight: 800, color: C.forest }}>{formatUGX(openProp?.rent_amount)}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Payment Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[{ v: 'mtn_momo', l: 'MTN MoMo', icon: <Smartphone size={16}/> }, { v: 'airtel_money', l: 'Airtel', icon: <Smartphone size={16}/> }, { v: 'bank', l: 'Bank', icon: <Landmark size={16}/> }].map(m => (
                <button key={m.v} onClick={() => setPayMethod(m.v)} style={{ padding: '10px 6px', border: `2px solid ${payMethod === m.v ? C.forest : C.border}`, borderRadius: 10, background: payMethod === m.v ? C.mint : C.white, color: payMethod === m.v ? C.forest : C.muted, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11 }}>
                  {m.icon}{m.l}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Your Phone / Account</label>
            <input placeholder="0772 000 001" value={payPhone} onChange={e => setPayPhone(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Transaction Reference</label>
            <input placeholder="e.g. 1234567890" value={payRef} onChange={e => setPayRef(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}/>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Pay via MoMo first, then enter the transaction ID here.</div>
          </div>
          <button onClick={submitPayment} disabled={saving || !payRef} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: !payRef ? C.muted : C.forest, color: C.white, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {saving ? 'Submitting...' : 'Submit Payment'}
          </button>
        </Modal>

        <Toast msg={toast.msg} visible={toast.show}/>
      </div>
    )
  }

  // ── MAIN DASHBOARD ──
  return (
    <div style={{ minHeight: '100vh', background: C.canvas, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: C.forest, padding: '52px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500 }}>
              {tab === 'properties' && 'My Rentals'}
              {tab === 'messages' && 'Inbox'}
              {tab === 'settings' && 'Account'}
            </div>
            <div style={{ color: C.white, fontWeight: 900, fontSize: 22, marginTop: 2, letterSpacing: '-0.3px' }}>
              {tab === 'properties' && firstName}
              {tab === 'messages' && 'Messages'}
              {tab === 'settings' && 'Settings'}
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.ochre, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 17, marginTop: 4, flexShrink: 0 }}>
            {firstName[0]}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 560, margin: '0 auto' }}>

        {/* ── PROPERTIES TAB ── */}
        {tab === 'properties' && (
          <div>
            {tenancies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
                <Building2 size={52} color={C.border} style={{ margin: '0 auto 14px' }}/>
                <div style={{ fontWeight: 800, fontSize: 18, color: C.charcoal, marginBottom: 8 }}>No properties linked</div>
                <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                  Ask your landlord for an invite code, then tap below to link your rental.
                </div>
                <button onClick={() => setShowLinkProp(true)} style={{ background: C.forest, border: 'none', borderRadius: 12, padding: '13px 28px', color: C.white, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Plus size={18}/> Link a Property
                </button>
              </div>
            ) : (
              <>
                {tenancies.map((t: any) => {
                  const paid = isRentPaid(t)
                  return (
                    <div key={t.id} onClick={() => setOpenProp(t)}
                      style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, borderLeft: `4px solid ${paid ? C.green : C.ochre}`, padding: 18, marginBottom: 12, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 17, color: C.charcoal }}>{t.property_name}</div>
                          <div style={{ fontSize: 13, color: C.muted, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12}/>{t.property_location}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 2, textTransform: 'capitalize' as const }}>Unit {t.unit_number} · {t.property_type || 'Residential'}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <div style={{ background: paid ? C.green + '15' : C.red + '12', border: `1px solid ${paid ? C.green : C.red}25`, borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: paid ? C.green : C.red }}>
                            {paid ? '✓ Paid' : 'Due'}
                          </div>
                          <ChevronRight size={16} color={C.muted}/>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 900, fontSize: 20, color: C.forest }}>{formatUGX(t.rent_amount)}<span style={{ fontSize: 12, fontWeight: 400, color: C.muted }}>/mo</span></div>
                        {t.amenities?.length > 0 && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            {t.amenities.slice(0, 3).map((a: string) => (
                              <div key={a} style={{ background: C.mint, borderRadius: 6, padding: '3px 7px', fontSize: 10, color: C.forest, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                                {AMENITY_ICONS[a] || <Shield size={11}/>}
                              </div>
                            ))}
                            {t.amenities.length > 3 && <div style={{ background: C.canvas, borderRadius: 6, padding: '3px 7px', fontSize: 10, color: C.muted }}>+{t.amenities.length - 3}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => setShowLinkProp(true)} style={{ width: '100%', padding: '13px', border: `1.5px dashed ${C.border}`, borderRadius: 16, background: 'transparent', color: C.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                  <Plus size={16}/> Link another property
                </button>
              </>
            )}
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {tab === 'messages' && (
          <div>
            {tenancies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>Link a property first to message your landlord.</div>
            ) : (
              <>
                <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, maxHeight: 440, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                  {myMessages.length === 0 && <div style={{ textAlign: 'center', color: C.muted, fontSize: 14, padding: 24 }}>No messages yet. Say hello!</div>}
                  {myMessages.map((m: any) => {
                    const isMine = m.sender_id === userId
                    return (
                      <div key={m.id} style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: isMine ? C.ochre : C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: isMine ? C.white : C.forest, flexShrink: 0 }}>{isMine ? firstName[0] : 'L'}</div>
                        <div style={{ maxWidth: '72%', background: isMine ? C.forest : C.white, border: isMine ? 'none' : `1px solid ${C.border}`, borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px' }}>
                          <div style={{ fontSize: 14, color: isMine ? C.white : C.charcoal, lineHeight: 1.5 }}>{m.content}</div>
                          <div style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.5)' : C.muted, marginTop: 4 }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Message your landlord..." style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: C.white }}/>
                  <button onClick={sendMessage} disabled={!msgText.trim()} style={{ background: C.forest, border: 'none', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.white, flexShrink: 0 }}><Send size={18}/></button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div>
            {/* Profile */}
            <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: C.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 22 }}>{firstName[0]}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: C.charcoal }}>{profile?.full_name}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>Tenant Account</div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Full Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Phone</label>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
              </div>
              <button onClick={saveProfile} disabled={saving} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 12, background: C.forest, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Save Changes</button>
            </div>

            {/* Change password */}
            <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={16}/> Change Password</div>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input type={showNewPass ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', background: '#FAFAF8', boxSizing: 'border-box' as const }}/>
                <button onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>
                  {showNewPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              <button onClick={changePassword} disabled={saving || newPassword.length < 6}
                style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 12, background: newPassword.length >= 6 ? C.ochre : C.border, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: newPassword.length < 6 ? 0.6 : 1 }}>
                Update Password
              </button>
            </div>

            {/* Sign out */}
            <button onClick={() => { clearSession(); router.push('/') }}
              style={{ width: '100%', padding: '14px', border: `1px solid ${C.red}30`, borderRadius: 16, background: C.red + '08', color: C.red, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              <LogOut size={18}/> Sign Out
            </button>

            {/* Delete account */}
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 16, background: 'transparent', color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                Delete my account
              </button>
            ) : (
              <div style={{ background: '#FFF5F5', border: `1px solid ${C.red}30`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.red, marginBottom: 6 }}>⚠️ Delete Account</div>
                <div style={{ fontSize: 13, color: C.body, lineHeight: 1.6, marginBottom: 14 }}>This permanently deletes everything. Type <strong>DELETE</strong> to confirm.</div>
                <input placeholder="Type DELETE to confirm" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.red}50`, fontSize: 14, outline: 'none', background: C.white, marginBottom: 10, boxSizing: 'border-box' as const }}/>
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
        )}
      </div>

      {/* ── CLEAN BOTTOM NAV — 3 items ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)}
            style={{ flex: 1, padding: '13px 4px 11px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: tab === n.key ? C.forest : C.muted, position: 'relative' }}>
            {(n.badge ?? 0) > 0 && <div style={{ position: 'absolute', top: 8, right: '50%', transform: 'translateX(12px)', background: C.red, color: C.white, borderRadius: 20, minWidth: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{n.badge}</div>}
            {n.icon}
            <div style={{ fontSize: 10, fontWeight: tab === n.key ? 700 : 400 }}>{n.label}</div>
            {tab === n.key && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2.5, background: C.forest, borderRadius: '0 0 3px 3px' }}/>}
          </button>
        ))}
      </div>

      {/* Link Property Modal */}
      <Modal open={showLinkProp} onClose={() => setShowLinkProp(false)} title="Link a Property">
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>Your landlord will give you an invite code. Enter it below to link to their property.</p>
        <input placeholder="Enter invite code (e.g. ABC123)" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 18, fontWeight: 700, outline: 'none', textAlign: 'center', letterSpacing: 4, marginBottom: 16, boxSizing: 'border-box' as const, fontFamily: 'monospace' }}/>
        <button onClick={linkProperty} disabled={saving || !inviteCode.trim()} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: inviteCode ? C.forest : C.muted, color: C.white, fontWeight: 700, fontSize: 15, cursor: inviteCode ? 'pointer' : 'not-allowed' }}>
          {saving ? 'Linking...' : 'Link Property'}
        </button>
      </Modal>

      <Toast msg={toast.msg} visible={toast.show}/>
    </div>
  )
}
