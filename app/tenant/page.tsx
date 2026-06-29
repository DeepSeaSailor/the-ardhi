'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, clearSession } from '@/lib/session'
import {
  Home, CreditCard, Users, Bell, Settings, AlertTriangle, CheckCircle,
  X, Phone, Building2, MapPin, Send, FileText, Download,
  LogOut, Star, MessageCircle, ChevronRight, Lock, User,
  Smartphone, Landmark, BookOpen, Eye, EyeOff, Clock
} from 'lucide-react'

const C = {
  forest: '#1B3A2D', forestLight: '#2A5240', ochre: '#C8922A',
  canvas: '#F9F6F1', charcoal: '#1A1A1A', body: '#3D3D3D',
  mint: '#EBF4EF', red: '#D64045', border: '#E8E4DC',
  muted: '#8A8A82', white: '#FFFFFF', green: '#2A7D4F'
}

function formatUGX(n: number) { return 'UGX ' + (n || 0).toLocaleString('en-UG') }

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
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
  return <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: C.charcoal, color: C.white, padding: '12px 20px', borderRadius: 40, fontWeight: 600, fontSize: 13, zIndex: 2000, whiteSpace: 'nowrap' as const, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={15}/>{msg}</div>
}

function StarRating({ value, onChange }: any) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <Star size={28} fill={n <= value ? C.ochre : 'none'} color={n <= value ? C.ochre : C.border}/>
        </button>
      ))}
    </div>
  )
}

export default function TenantDashboard() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState('home')
  const [profile, setProfile] = useState<any>(null)
  const [tenancy, setTenancy] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [neighbors, setNeighbors] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, msg: '' })

  // Modals
  const [showPay, setShowPay] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [showMsg, setShowMsg] = useState(false)

  // Form state
  const [payMethod, setPayMethod] = useState('mtn_momo')
  const [payPhone, setPayPhone] = useState('')
  const [payRef, setPayRef] = useState('')
  const [alertMsg, setAlertMsg] = useState('')
  const [alertType, setAlertType] = useState('security')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [msgText, setMsgText] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

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
      const [pRes, tRes, payRes, nRes, aRes, bRes, mRes] = await Promise.all([
        apiFetch('/api/tenant/profile'), apiFetch('/api/tenant/tenancy'),
        apiFetch('/api/tenant/payments'), apiFetch('/api/tenant/neighbors'),
        apiFetch('/api/tenant/alerts'), apiFetch('/api/tenant/bookings'),
        apiFetch('/api/tenant/messages'),
      ])
      const [p, t, pay, n, a, b, m] = await Promise.all([pRes.json(), tRes.json(), payRes.json(), nRes.json(), aRes.json(), bRes.json(), mRes.json()])
      if (p.data) { setProfile(p.data); setEditName(p.data.full_name || ''); setEditPhone(p.data.phone || '') }
      if (t.data) setTenancy(t.data)
      setPayments(pay.data || [])
      setNeighbors(n.data || [])
      setAlerts(a.data || [])
      setBookings(b.data || [])
      setMessages(m.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [userId, apiFetch])

  useEffect(() => { if (userId) fetchData() }, [userId, fetchData])

  const firstName = profile?.full_name?.split(' ')[0] || 'Tenant'
  const thisMonthPaid = payments.some((p: any) => {
    const d = new Date(p.created_at); const now = new Date()
    return p.status === 'confirmed' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  async function submitPayment() {
    if (!payRef) { showToast('Enter payment reference'); return }
    setSaving(true)
    try {
      const res = await apiFetch('/api/tenant/payments', { method: 'POST', body: JSON.stringify({ amount: tenancy?.rent_amount, payment_method: payMethod, reference: payRef, phone_or_account: payPhone }) })
      if (res.ok) { showToast('Payment submitted — awaiting confirmation'); setShowPay(false); setPayRef(''); fetchData() }
    } finally { setSaving(false) }
  }

  async function postAlert() {
    if (!alertMsg.trim()) return
    setSaving(true)
    try {
      const res = await apiFetch('/api/tenant/alerts', { method: 'POST', body: JSON.stringify({ message: alertMsg, type: alertType }) })
      if (res.ok) { showToast('Alert posted'); setShowAlert(false); setAlertMsg(''); fetchData() }
    } finally { setSaving(false) }
  }

  async function submitReview() {
    if (!reviewRating) { showToast('Please select a rating'); return }
    setSaving(true)
    try {
      const res = await apiFetch('/api/tenant/reviews', { method: 'POST', body: JSON.stringify({ property_id: tenancy?.property_id, rating: reviewRating, comment: reviewComment }) })
      if (res.ok) { showToast('Review submitted'); setShowReview(false); setReviewRating(0); setReviewComment('') }
    } finally { setSaving(false) }
  }

  async function sendMessage() {
    if (!msgText.trim()) return
    setSaving(true)
    try {
      const landlordId = tenancy?.landlord_id
      const res = await apiFetch('/api/tenant/messages', { method: 'POST', body: JSON.stringify({ receiver_id: landlordId, content: msgText, property_id: tenancy?.property_id }) })
      if (res.ok) { setMsgText(''); fetchData() }
    } finally { setSaving(false) }
  }

  async function deleteAccount() {
    setSaving(true)
    try {
      const res = await apiFetch('/api/auth/delete-account', { method: 'DELETE' })
      if (res.ok) { clearSession(); router.push('/') }
      else { const d = await res.json(); showToast(d.error || 'Failed to delete account') }
    } finally { setSaving(false) }
  }

  async function saveProfile() {
    setSaving(true)
    try {
      await apiFetch('/api/tenant/profile', { method: 'PATCH', body: JSON.stringify({ full_name: editName, phone: editPhone }) })
      showToast('Profile updated')
      fetchData()
    } finally { setSaving(false) }
  }

  async function changePassword() {
    if (newPassword.length < 6) { showToast('Password must be at least 6 characters'); return }
    setSaving(true)
    try {
      const res = await apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ password: newPassword }) })
      if (res.ok) { showToast('Password changed'); setNewPassword('') }
      else showToast('Failed — try again')
    } finally { setSaving(false) }
  }

  const myMessages = messages.filter((m: any) => m.sender_id === userId || m.receiver_id === userId)
  const unreadAlerts = alerts.filter((a: any) => !a.is_read).length

  const NAV = [
    { key: 'home', icon: <Home size={22}/>, label: 'Home' },
    { key: 'payments', icon: <CreditCard size={22}/>, label: 'Payments' },
    { key: 'messages', icon: <MessageCircle size={22}/>, label: 'Messages', badge: myMessages.filter((m: any) => !m.is_read && m.receiver_id === userId).length },
    { key: 'alerts', icon: <Bell size={22}/>, label: 'Alerts', badge: unreadAlerts },
    { key: 'settings', icon: <Settings size={22}/>, label: 'Settings' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas, flexDirection: 'column', gap: 12 }}>
      <img src="/ardhi-logo.png" style={{ width: 60, height: 60, objectFit: 'contain' }}/>
      <div style={{ color: C.muted, fontSize: 14 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, paddingBottom: 80 }}>

      {/* ── CLEAN HEADER ── */}
      <div style={{ background: C.forest, padding: '52px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500 }}>
              {tab === 'home' && `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}`}
              {tab === 'payments' && 'Payments'}
              {tab === 'messages' && 'Messages'}
              {tab === 'alerts' && 'Community Alerts'}
              {tab === 'settings' && 'Account'}
            </div>
            <div style={{ color: C.white, fontWeight: 800, fontSize: 22, marginTop: 2, letterSpacing: '-0.3px' }}>
              {tab === 'home' && firstName}
              {tab === 'payments' && 'Rent & History'}
              {tab === 'messages' && 'Landlord Chat'}
              {tab === 'alerts' && 'Your Community'}
              {tab === 'settings' && 'Settings'}
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.ochre, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 17, marginTop: 4, flexShrink: 0 }}>
            {firstName[0]}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>

        {/* ── HOME ── */}
        {tab === 'home' && (
          <div>
            {/* Property card */}
            {tenancy ? (
              <div style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.forestLight})`, borderRadius: 20, padding: 20, marginBottom: 16, color: C.white }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={20}/></div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{tenancy.property_name}</div>
                    <div style={{ fontSize: 13, opacity: 0.65, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11}/>{tenancy.property_location}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>Monthly rent</div>
                    <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px' }}>{formatUGX(tenancy.rent_amount)}</div>
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Unit {tenancy.unit_number}</div>
                  </div>
                  <div style={{ background: thisMonthPaid ? 'rgba(42,125,79,0.3)' : 'rgba(214,64,69,0.3)', border: `1px solid ${thisMonthPaid ? C.green : C.red}`, borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: thisMonthPaid ? '#6EE7A0' : '#FC8181' }}>
                    {thisMonthPaid ? '✓ Paid' : 'Unpaid'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, marginBottom: 16, textAlign: 'center' }}>
                <Building2 size={40} color={C.border} style={{ margin: '0 auto 12px' }}/>
                <div style={{ fontWeight: 700, color: C.charcoal }}>No property linked</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Ask your landlord for an invite code</div>
              </div>
            )}

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Pay Rent', icon: <CreditCard size={20}/>, color: C.ochre, bg: '#FFF8EC', action: () => setShowPay(true), disabled: thisMonthPaid },
                { label: 'Post Alert', icon: <Bell size={20}/>, color: C.red, bg: '#FFF5F5', action: () => setShowAlert(true) },
                { label: 'Message', icon: <MessageCircle size={20}/>, color: C.forest, bg: C.mint, action: () => setTab('messages') },
                { label: 'Leave Review', icon: <Star size={20}/>, color: C.ochre, bg: '#FFF8EC', action: () => setShowReview(true) },
              ].map(a => (
                <button key={a.label} onClick={a.action} disabled={a.disabled}
                  style={{ background: a.disabled ? '#F5F5F3' : a.bg, border: `1px solid ${a.disabled ? C.border : a.color + '30'}`, borderRadius: 16, padding: '16px 14px', cursor: a.disabled ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: a.disabled ? 0.5 : 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: a.disabled ? C.border + '30' : a.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.disabled ? C.muted : a.color, marginBottom: 8 }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: a.disabled ? C.muted : C.charcoal }}>{a.label}</div>
                  {a.disabled && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Already paid</div>}
                </button>
              ))}
            </div>

            {/* Booking history */}
            {bookings.length > 0 && (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 12 }}>My Bookings</h3>
                {bookings.map((b: any) => (
                  <div key={b.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, borderLeft: `3px solid ${b.status === 'approved' ? C.green : b.status === 'rejected' ? C.red : C.ochre}`, padding: '14px 16px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: C.charcoal }}>{b.listing_title}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{b.listing_location} · Unit {b.listing_unit}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{formatUGX(b.listing_rent)}/month</div>
                      </div>
                      <span style={{ background: (b.status === 'approved' ? C.green : b.status === 'rejected' ? C.red : C.ochre) + '15', color: b.status === 'approved' ? C.green : b.status === 'rejected' ? C.red : C.ochre, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' as const }}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Neighbors */}
            {neighbors.length > 0 && (
              <>
                <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, margin: '20px 0 12px' }}>Your Building</h3>
                <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                  {neighbors.map((n: any, i: number) => (
                    <div key={n.id} style={{ padding: '14px 16px', borderBottom: i < neighbors.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.forest, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>#{n.unit_number}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: C.charcoal }}>Unit {n.unit_number}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>Fellow tenant</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {tab === 'payments' && (
          <div>
            <div style={{ background: `linear-gradient(135deg, ${C.forest}, ${C.forestLight})`, borderRadius: 20, padding: 20, marginBottom: 16, color: C.white }}>
              <div style={{ fontSize: 13, opacity: 0.6 }}>Monthly rent</div>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.5px', marginTop: 4 }}>{formatUGX(tenancy?.rent_amount)}</div>
              <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>Unit {tenancy?.unit_number} · {tenancy?.property_name}</div>
              <div style={{ marginTop: 14 }}>
                {!thisMonthPaid ? (
                  <button onClick={() => setShowPay(true)} style={{ background: C.ochre, border: 'none', borderRadius: 12, padding: '12px 24px', color: C.white, fontWeight: 700, fontSize: 15, cursor: 'pointer', width: '100%' }}>Pay Rent Now</button>
                ) : (
                  <div style={{ background: 'rgba(42,125,79,0.25)', borderRadius: 12, padding: '12px', textAlign: 'center', color: '#6EE7A0', fontWeight: 700 }}>✓ This month is paid</div>
                )}
              </div>
            </div>

            <button onClick={async () => {
              const { downloadAgreementPDF } = await import('@/components/TenancyPDF')
              await downloadAgreementPDF({ tenantName: profile?.full_name || 'Tenant', nationalId: profile?.national_id || 'N/A', phone: profile?.phone || 'N/A', email: profile?.email || 'N/A', landlordName: 'Landlord', propertyName: tenancy?.property_name || 'N/A', location: tenancy?.property_location || 'Uganda', unitNumber: tenancy?.unit_number || 'N/A', rentAmount: tenancy?.rent_amount || 0, depositAmount: 0, startDate: tenancy?.start_date || new Date().toLocaleDateString(), signedAt: new Date().toLocaleString() })
            }} style={{ width: '100%', padding: '13px', border: `1px solid ${C.border}`, borderRadius: 14, background: C.white, color: C.forest, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Download size={16}/> Download Tenancy Agreement
            </button>

            <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 12 }}>Payment History</h3>
            {payments.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: C.muted, background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>No payments yet.</div>}
            {payments.map((p: any) => (
              <div key={p.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.charcoal }}>{formatUGX(p.amount)}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.payment_method?.replace(/_/g, ' ')} · {new Date(p.created_at).toLocaleDateString()}</div>
                  {p.reference && <div style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>Ref: {p.reference}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ background: (p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre) + '15', color: p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>{p.status}</span>
                  {p.status === 'pending' && <button onClick={async () => { setPayments(prev => prev.filter((x: any) => x.id !== p.id)); apiFetch('/api/tenant/payments/' + p.id, { method: 'DELETE' }).then(() => showToast('Payment deleted')).catch(() => fetchData()) }} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600 }}>🗑 Delete</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div>
            {!tenancy ? (
              <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>Link to a property first to message your landlord.</div>
            ) : (
              <>
                <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 12, maxHeight: 420, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {myMessages.length === 0 && <div style={{ textAlign: 'center', color: C.muted, fontSize: 14, padding: 24 }}>No messages yet. Say hi to your landlord!</div>}
                  {myMessages.map((m: any) => {
                    const isMine = m.sender_id === userId
                    return (
                      <div key={m.id} style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: isMine ? C.ochre : C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: isMine ? C.white : C.forest, flexShrink: 0 }}>{isMine ? firstName[0] : 'L'}</div>
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

        {/* ── ALERTS ── */}
        {tab === 'alerts' && (
          <div>
            <button onClick={() => setShowAlert(true)} style={{ width: '100%', background: C.red, border: 'none', borderRadius: 14, padding: '14px', color: C.white, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <AlertTriangle size={18}/> Post Community Alert
            </button>
            {alerts.length === 0 && <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 40, textAlign: 'center', color: C.muted }}>No alerts yet. Stay safe!</div>}
            {alerts.map((a: any) => (
              <div key={a.id} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, borderLeft: `3px solid ${a.type === 'security' ? C.red : C.ochre}`, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ background: (a.type === 'security' ? C.red : C.ochre) + '15', color: a.type === 'security' ? C.red : C.ochre, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' as const }}>{a.type}</span>
                </div>
                <div style={{ fontSize: 14, color: C.body, lineHeight: 1.6 }}>{a.message}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{new Date(a.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div>
            {/* Profile */}
            <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 22 }}>{firstName[0]}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: C.charcoal }}>{profile?.full_name}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>Tenant · Unit {tenancy?.unit_number}</div>
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
              <button onClick={changePassword} disabled={saving || newPassword.length < 6} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 12, background: C.ochre, color: C.white, fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: newPassword.length < 6 ? 0.5 : 1 }}>Update Password</button>
            </div>

            {/* Property info */}
            {tenancy && (
              <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={16}/> My Property</div>
                {[
                  { l: 'Property', v: tenancy.property_name },
                  { l: 'Location', v: tenancy.property_location },
                  { l: 'Unit', v: `Unit ${tenancy.unit_number}` },
                  { l: 'Monthly Rent', v: formatUGX(tenancy.rent_amount) },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 13, color: C.muted }}>{r.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal }}>{r.v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Sign out */}
            <button onClick={() => { clearSession(); router.push('/') }}
              style={{ width: '100%', padding: '14px', border: `1px solid ${C.red}30`, borderRadius: 16, background: C.red + '08', color: C.red, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              <LogOut size={18}/> Sign Out
            </button>

            {/* Delete account */}
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)}
                style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 16, background: 'transparent', color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
                Delete my account
              </button>
            ) : (
              <div style={{ background: '#FFF5F5', border: `1px solid ${C.red}30`, borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.red, marginBottom: 6 }}>⚠️ Delete Account</div>
                <div style={{ fontSize: 13, color: C.body, lineHeight: 1.6, marginBottom: 16 }}>
                  This will permanently delete your account, payment history, and all your data. This cannot be undone.
                  Type <strong>DELETE</strong> to confirm.
                </div>
                <input
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.red}50`, fontSize: 14, outline: 'none', background: C.white, marginBottom: 12, boxSizing: 'border-box' as const }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                    style={{ flex: 1, padding: '11px', border: `1px solid ${C.border}`, borderRadius: 10, background: C.white, color: C.muted, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                    Cancel
                  </button>
                  <button onClick={deleteAccount} disabled={deleteConfirmText !== 'DELETE' || saving}
                    style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 10, background: deleteConfirmText === 'DELETE' ? C.red : C.border, color: C.white, fontWeight: 700, cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed', fontSize: 14 }}>
                    {saving ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CLEAN BOTTOM NAV ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)}
            style={{ flex: 1, padding: '12px 4px 10px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: tab === n.key ? C.forest : C.muted, position: 'relative' }}>
            {(n.badge ?? 0) > 0 && <div style={{ position: 'absolute', top: 8, right: '50%', transform: 'translateX(12px)', background: C.red, color: C.white, borderRadius: 20, minWidth: 16, height: 16, fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{n.badge}</div>}
            {n.icon}
            <div style={{ fontSize: 10, fontWeight: tab === n.key ? 700 : 400, letterSpacing: '0.01em' }}>{n.label}</div>
            {tab === n.key && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2.5, background: C.forest, borderRadius: '0 0 3px 3px' }}/>}
          </button>
        ))}
      </div>

      {/* ── PAY MODAL ── */}
      <Modal open={showPay} onClose={() => setShowPay(false)} title="Pay Rent">
        <div style={{ background: C.mint, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: C.forest }}>Amount due</div>
          <div style={{ fontWeight: 800, color: C.forest }}>{formatUGX(tenancy?.rent_amount)}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Payment Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[{ v: 'mtn_momo', l: 'MTN MoMo', icon: <Smartphone size={16}/> }, { v: 'airtel_money', l: 'Airtel', icon: <Smartphone size={16}/> }, { v: 'bank', l: 'Bank', icon: <Landmark size={16}/> }].map(m => (
              <button key={m.v} onClick={() => setPayMethod(m.v)} style={{ padding: '10px 8px', border: `2px solid ${payMethod === m.v ? C.forest : C.border}`, borderRadius: 10, background: payMethod === m.v ? C.mint : C.white, color: payMethod === m.v ? C.forest : C.muted, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11 }}>
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
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Transaction Reference / ID</label>
          <input placeholder="e.g. 1234567890" value={payRef} onChange={e => setPayRef(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}/>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Send money first, then enter the transaction ID from your MoMo/bank.</div>
        </div>
        <button onClick={submitPayment} disabled={saving || !payRef} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: !payRef ? C.muted : C.forest, color: C.white, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          {saving ? 'Submitting...' : 'Submit Payment'}
        </button>
      </Modal>

      {/* ── ALERT MODAL ── */}
      <Modal open={showAlert} onClose={() => setShowAlert(false)} title="Post Alert">
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[{ v: 'security', l: '🚨 Security' }, { v: 'maintenance', l: '🔧 Maintenance' }, { v: 'general', l: '📢 General' }].map(t => (
            <button key={t.v} onClick={() => setAlertType(t.v)} style={{ flex: 1, padding: '10px 6px', border: `2px solid ${alertType === t.v ? C.red : C.border}`, borderRadius: 10, background: alertType === t.v ? '#FFF5F5' : C.white, color: alertType === t.v ? C.red : C.muted, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>{t.l}</button>
          ))}
        </div>
        <textarea placeholder="Describe the situation clearly..." value={alertMsg} onChange={e => setAlertMsg(e.target.value)} rows={4}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'none' as const, marginBottom: 16, boxSizing: 'border-box' as const }}/>
        <button onClick={postAlert} disabled={saving || !alertMsg.trim()} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: C.red, color: C.white, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Post Alert</button>
      </Modal>

      {/* ── REVIEW MODAL ── */}
      <Modal open={showReview} onClose={() => setShowReview(false)} title="Leave a Review">
        <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 14, color: C.muted }}>Rate {tenancy?.property_name}</div>
        <StarRating value={reviewRating} onChange={setReviewRating}/>
        <textarea placeholder="Share your experience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'none' as const, marginBottom: 16, boxSizing: 'border-box' as const }}/>
        <button onClick={submitReview} disabled={saving || !reviewRating} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: !reviewRating ? C.muted : C.ochre, color: C.white, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Submit Review</button>
      </Modal>

      <Toast msg={toast.msg} visible={toast.show}/>
    </div>
  )
}
