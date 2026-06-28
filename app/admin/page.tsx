'use client'
import { useState, useEffect, useCallback } from 'react'

const C = { forest: '#1B3A2D', ochre: '#C8922A', canvas: '#F7F5F0', charcoal: '#2C2C2C', mint: '#E8F0EB', red: '#D64045', border: '#D6D6D0', muted: '#7A7A72', white: '#FFFFFF', green: '#2A7D4F', purple: '#5B6AF0' }

function formatUGX(n: number) { return 'UGX ' + n.toLocaleString('en-UG') }

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState<any>({})
  const [landlords, setLandlords] = useState<any[]>([])
  const [tenants, setTenants] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [sRes, lRes, tRes, pRes, payRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/landlords'),
        fetch('/api/admin/tenants'),
        fetch('/api/admin/properties'),
        fetch('/api/admin/payments'),
      ])
      const [s, l, t, p, pay] = await Promise.all([sRes.json(), lRes.json(), tRes.json(), pRes.json(), payRes.json()])
      setStats(s.data || {})
      setLandlords(l.data || [])
      setTenants(t.data || [])
      setProperties(p.data || [])
      setPayments(pay.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function toggleUser(id: string, currentStatus: boolean) {
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !currentStatus }) })
    fetchData()
  }

  async function confirmPayment(id: string) {
    await fetch(`/api/admin/payments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) })
    fetchData()
  }

  const NAV = [
    { key: 'overview', icon: '⊞', label: 'Overview' },
    { key: 'landlords', icon: '🏢', label: 'Landlords' },
    { key: 'tenants', icon: '👥', label: 'Tenants' },
    { key: 'properties', icon: '🏘️', label: 'Properties' },
    { key: 'payments', icon: '💳', label: 'Payments' },
  ]

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.canvas }}><div>Loading admin console...</div></div>

  return (
    <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: C.purple, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, letterSpacing: '-0.5px' }}>The Ardhi</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Admin Console</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>⚙️ Super Admin</div>
      </div>

      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 900, margin: '0 auto', width: '100%' }}>

        {tab === 'overview' && (
          <div>
            <h2 style={{ margin: '0 0 18px', fontWeight: 800, fontSize: 22 }}>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total Landlords', value: stats.total_landlords || landlords.length, icon: '🏢', color: C.forest },
                { label: 'Total Tenants', value: stats.total_tenants || tenants.length, icon: '👥', color: C.ochre },
                { label: 'Total Properties', value: stats.total_properties || properties.length, icon: '🏘️', color: C.purple },
                { label: 'Total Payments', value: formatUGX(stats.total_payments || 0), icon: '💰', color: C.green },
                { label: 'Pending Payments', value: payments.filter((p: any) => p.status === 'pending').length, icon: '⏳', color: C.ochre },
                { label: 'Active Units', value: stats.occupied_units || 0, icon: '🔑', color: C.forest },
              ].map(s => (
                <div key={s.label} style={{ background: C.white, borderRadius: 12, border: '1px solid var(--border)', padding: 16 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Pending payments to confirm */}
            <h3 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 16 }}>Pending Payment Confirmations</h3>
            {payments.filter((p: any) => p.status === 'pending').length === 0 ? (
              <div style={{ background: C.mint, borderRadius: 10, padding: 14, textAlign: 'center', color: C.green, fontWeight: 600 }}>No pending confirmations ✓</div>
            ) : payments.filter((p: any) => p.status === 'pending').map((p: any) => (
              <div key={p.id} style={{ background: C.white, borderRadius: 10, border: '1px solid var(--border)', borderLeft: `4px solid ${C.ochre}`, padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.tenant_name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.payment_method?.replace(/_/g, ' ')} · {p.phone_or_account}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.property_name} · {new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{formatUGX(p.amount)}</div>
                  <button onClick={() => confirmPayment(p.id)} style={{ marginTop: 6, padding: '6px 14px', border: 'none', borderRadius: 6, background: C.green, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Confirm</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'landlords' && (
          <div>
            <h2 style={{ margin: '0 0 18px', fontWeight: 800, fontSize: 22 }}>All Landlords ({landlords.length})</h2>
            {landlords.map((l: any) => (
              <div key={l.id} style={{ background: C.white, borderRadius: 10, border: '1px solid var(--border)', padding: 16, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{l.full_name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{l.email} · {l.phone}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Joined {new Date(l.created_at).toLocaleDateString()}</div>
                  <div style={{ fontSize: 12, color: C.forest, marginTop: 4, fontWeight: 600 }}>{l.property_count || 0} properties · {l.tenant_count || 0} tenants</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: (l.is_active ? C.green : C.red) + '18', color: l.is_active ? C.green : C.red, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 8 }}>{l.is_active ? 'Active' : 'Suspended'}</span>
                  <button onClick={() => toggleUser(l.id, l.is_active)} style={{ padding: '6px 12px', border: `1px solid ${l.is_active ? C.red : C.green}`, borderRadius: 6, background: 'none', color: l.is_active ? C.red : C.green, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                    {l.is_active ? 'Suspend' : 'Reinstate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'tenants' && (
          <div>
            <h2 style={{ margin: '0 0 18px', fontWeight: 800, fontSize: 22 }}>All Tenants ({tenants.length})</h2>
            {tenants.map((t: any) => (
              <div key={t.id} style={{ background: C.white, borderRadius: 10, border: '1px solid var(--border)', padding: 16, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.full_name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{t.email} · {t.phone}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>ID: {t.national_id || 'Not provided'}</div>
                  <div style={{ fontSize: 12, color: C.forest, fontWeight: 600, marginTop: 4 }}>{t.property_name} · Unit {t.unit_number}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800 }}>{formatUGX(t.rent_amount || 0)}</div>
                  <span style={{ fontSize: 11, color: C.muted }}>/month</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'properties' && (
          <div>
            <h2 style={{ margin: '0 0 18px', fontWeight: 800, fontSize: 22 }}>All Properties ({properties.length})</h2>
            {properties.map((p: any) => (
              <div key={p.id} style={{ background: C.white, borderRadius: 10, border: '1px solid var(--border)', padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>📍 {p.location}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Landlord: {p.landlord_name}</div>
                  </div>
                  <span style={{ background: C.mint, color: C.forest, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, height: 'fit-content' }}>{p.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div><span style={{ fontWeight: 700, color: C.forest }}>{p.total_units}</span> <span style={{ fontSize: 12, color: C.muted }}>units</span></div>
                  <div><span style={{ fontWeight: 700, color: C.ochre }}>{p.occupied_units}</span> <span style={{ fontSize: 12, color: C.muted }}>occupied</span></div>
                  <div><span style={{ fontWeight: 700, color: C.muted, fontFamily: 'monospace', fontSize: 13 }}>{p.invite_code}</span> <span style={{ fontSize: 11, color: C.muted }}>invite code</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'payments' && (
          <div>
            <h2 style={{ margin: '0 0 18px', fontWeight: 800, fontSize: 22 }}>All Payments</h2>
            {payments.map((p: any) => (
              <div key={p.id} style={{ background: C.white, borderRadius: 10, border: '1px solid var(--border)', borderLeft: `4px solid ${p.status === 'confirmed' ? C.green : p.status === 'failed' ? C.red : C.ochre}`, padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.tenant_name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.property_name} · {p.payment_method?.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.phone_or_account} · {new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{formatUGX(p.amount)}</div>
                  {p.status === 'pending' && <button onClick={() => confirmPayment(p.id)} style={{ marginTop: 6, padding: '5px 12px', border: 'none', borderRadius: 6, background: C.green, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Confirm</button>}
                  {p.status !== 'pending' && <span style={{ fontSize: 11, fontWeight: 700, color: p.status === 'confirmed' ? C.green : C.red }}>{p.status}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: C.white, borderTop: '1px solid var(--border)', display: 'flex', position: 'sticky', bottom: 0, zIndex: 100 }}>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ flex: 1, padding: '10px 4px 8px', border: 'none', background: 'none', cursor: 'pointer', borderTop: `2px solid ${tab === n.key ? C.purple : 'transparent'}`, color: tab === n.key ? C.purple : C.muted }}>
            <div style={{ fontSize: 18 }}>{n.icon}</div>
            <div style={{ fontSize: 9, fontWeight: 600, marginTop: 2 }}>{n.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
