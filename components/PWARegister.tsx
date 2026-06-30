'use client'
import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('SW registration failed:', err)
      })
    }

    // Detect standalone mode (already installed)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Detect iOS (no beforeinstallprompt support — needs manual instructions)
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    if (standalone) return

    // Check if user already dismissed the banner this session
    const dismissed = sessionStorage.getItem('ardhi-install-dismissed')
    if (dismissed) return

    // Android/Chrome — capture native install prompt
    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
      setTimeout(() => setShowBanner(true), 2500) // small delay so it's not jarring on load
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS — show custom banner after a delay since there's no native prompt event
    if (ios) {
      setTimeout(() => setShowBanner(true), 3500)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') setShowBanner(false)
      setInstallPrompt(null)
    }
  }

  function dismiss() {
    setShowBanner(false)
    sessionStorage.setItem('ardhi-install-dismissed', '1')
  }

  if (isStandalone || !showBanner) return null

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 9999,
      maxWidth: 420, margin: '0 auto',
      background: '#1B3A2D', borderRadius: 16, padding: '16px 16px 16px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      animation: 'slideUp 0.3s ease',
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <img src="/icons/icon-72.png" alt="" style={{ width: 28, height: 28 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Install The Ardhi</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>
          {isIOS
            ? 'Tap Share, then "Add to Home Screen"'
            : 'Quick access from your home screen'}
        </div>
      </div>
      {!isIOS && (
        <button
          onClick={handleInstall}
          style={{
            background: '#fff', color: '#1B3A2D', border: 'none', borderRadius: 10,
            padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0
          }}
        >
          <Download size={14} /> Install
        </button>
      )}
      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer', padding: 4, flexShrink: 0
        }}
      >
        <X size={18} />
      </button>
    </div>
  )
}
