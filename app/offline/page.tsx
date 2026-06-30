'use client'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: 32, background: '#F9F6F1', fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: '#1B3A2D15',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
      }}>
        <WifiOff size={32} color="#1B3A2D" />
      </div>
      <div style={{ fontWeight: 800, fontSize: 20, color: '#1A1A1A', marginBottom: 8 }}>
        You're offline
      </div>
      <div style={{ color: '#8A8A82', fontSize: 14, lineHeight: 1.6, maxWidth: 280, marginBottom: 28 }}>
        Check your connection and try again. Some cached pages may still be available.
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#1B3A2D', color: '#fff', border: 'none', borderRadius: 12,
          padding: '13px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8
        }}
      >
        <RefreshCw size={16} /> Try Again
      </button>
    </div>
  )
}
