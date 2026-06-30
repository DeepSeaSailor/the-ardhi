'use client'
import { useState, useEffect } from 'react'
import Logo from '@/components/Logo'
import { MapPin, Home, Building2, ShoppingBag, Coffee, Search, Wifi, Shield, Car, Zap, Droplets, Tv, Wind, ChevronRight, Phone, ArrowLeft } from 'lucide-react'

const C = { forest: '#1B3A2D', ochre: '#C8922A', canvas: '#F9F6F1', charcoal: '#1A1A1A', mint: '#EBF4EF', red: '#D64045', border: '#E8E4DC', muted: '#8A8A82', white: '#FFFFFF', green: '#2A7D4F' }

function formatUGX(n: number) { return 'UGX ' + (n || 0).toLocaleString('en-UG') }

const AMENITY_ICONS: Record<string, any> = {
  'WiFi': <Wifi size={14}/>, 'Security': <Shield size={14}/>, 'Parking': <Car size={14}/>,
  'Generator': <Zap size={14}/>, 'Water': <Droplets size={14}/>, 'DSTV': <Tv size={14}/>,
  'Air Conditioning': <Wind size={14}/>, 'Furnished': <Home size={14}/>,
}

const PROP_ICONS: Record<string, any> = {
  apartment: <Building2 size={20}/>, residential: <Home size={20}/>,
  commercial: <ShoppingBag size={20}/>, hostel: <Home size={20}/>,
  mall: <ShoppingBag size={20}/>, shop: <Coffee size={20}/>,
}

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetch('/api/listings').then(r => r.json()).then(d => { setListings(d.data || []); setLoading(false) })
  }, [])

  const filtered = listings.filter(l => {
    const matchSearch = l.title?.toLowerCase().includes(search.toLowerCase()) || l.location?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || l.property_type === filter
    return matchSearch && matchFilter
  })

  const FILTERS = [
    { v: 'all', l: 'All' }, { v: 'apartment', l: 'Apartments' }, { v: 'residential', l: 'Residential' },
    { v: 'commercial', l: 'Commercial' }, { v: 'hostel', l: 'Hostels' }, { v: 'shop', l: 'Shops' },
  ]

  if (selected) return (
    <div style={{ minHeight: '100vh', background: C.canvas }}>
      <div style={{ background: C.forest, padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, cursor: 'pointer' }}><ArrowLeft size={18}/></button>
        <div style={{ color: C.white, fontWeight: 800, fontSize: 17 }}>{selected.title}</div>
      </div>
      <div style={{ padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Hero card */}
        <div style={{ background: `linear-gradient(135deg, ${C.forest}, #2A5240)`, borderRadius: 20, padding: 24, marginBottom: 16, color: C.white }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 4 }}>Monthly Rent</div>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.5px' }}>{formatUGX(selected.rent_amount)}</div>
              {selected.deposit_amount > 0 && <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>Deposit: {formatUGX(selected.deposit_amount)}</div>}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 700, color: C.ochre }}>Available</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.75, fontSize: 14 }}><MapPin size={14}/>{selected.location}</div>
        </div>

        {/* Details */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 12 }}>About this property</h3>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{selected.description || 'No description provided.'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
            <div style={{ background: C.canvas, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Unit</div>
              <div style={{ fontWeight: 700, color: C.charcoal }}>{selected.unit_number}</div>
            </div>
            <div style={{ background: C.canvas, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Type</div>
              <div style={{ fontWeight: 700, color: C.charcoal, textTransform: 'capitalize' }}>{selected.property_type}</div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {selected.amenities?.length > 0 && (
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 14 }}>Amenities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {selected.amenities.map((a: string) => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.mint, borderRadius: 8, padding: '7px 12px', color: C.forest, fontSize: 13, fontWeight: 600 }}>
                  {AMENITY_ICONS[a] || <Shield size={14}/>} {a}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, color: C.charcoal, marginBottom: 8 }}>Interested in this property?</h3>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>Create an account and the landlord will send you a direct link to complete your tenancy application.</p>
          <a href="/" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: C.ochre, color: C.white, fontWeight: 700, fontSize: 15, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
            Sign Up to Apply
          </a>
          <a href="/" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'center', marginTop: 10, textDecoration: 'none' }}>
            Already have an account? Sign In
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.canvas }}>
      {/* Header */}
      <div style={{ background: C.forest, padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Logo size={34} />
          <a href="/" style={{ background: C.ochre, color: C.white, borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Sign In</a>
        </div>
        <h1 style={{ color: C.white, fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 4 }}>Find your next home</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 16 }}>Browse available properties across Uganda</p>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
          <input placeholder="Search by location or property name..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12, border: 'none', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '14px 16px', background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 8, overflowX: 'auto' }}>
        {FILTERS.map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)} style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${filter === f.v ? C.forest : C.border}`, background: filter === f.v ? C.forest : C.white, color: filter === f.v ? C.white : C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto' }}>
        {loading && <div style={{ textAlign: 'center', padding: 48, color: C.muted }}>Loading properties...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
            <Home size={48} color={C.border} style={{ margin: '0 auto 12px' }}/>
            <div style={{ fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>No properties found</div>
            <div style={{ color: C.muted, fontSize: 14 }}>Try a different search or filter</div>
          </div>
        )}
        {filtered.map((l: any) => (
          <div key={l.id} onClick={() => setSelected(l)} style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: 18, marginBottom: 12, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.forest, flexShrink: 0 }}>
                    {PROP_ICONS[l.property_type] || <Home size={20}/>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.charcoal }}>{l.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.muted, fontSize: 13 }}><MapPin size={11}/>{l.location}</div>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={C.muted}/>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: C.forest }}>{formatUGX(l.rent_amount)}</div>
                <div style={{ fontSize: 12, color: C.muted }}>per month · Unit {l.unit_number}</div>
              </div>
              {l.amenities?.length > 0 && (
                <div style={{ display: 'flex', gap: 4 }}>
                  {l.amenities.slice(0, 3).map((a: string) => (
                    <div key={a} style={{ background: C.canvas, borderRadius: 6, padding: '4px 8px', fontSize: 11, color: C.forest, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {AMENITY_ICONS[a] || <Shield size={11}/>}
                    </div>
                  ))}
                  {l.amenities.length > 3 && <div style={{ background: C.canvas, borderRadius: 6, padding: '4px 8px', fontSize: 11, color: C.muted }}>+{l.amenities.length - 3}</div>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
