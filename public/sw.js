// The Ardhi — Service Worker
// Strategy: app-shell cache-first, API network-first (with cache fallback), offline page for nav failures.

const VERSION = 'v1'
const STATIC_CACHE = `ardhi-static-${VERSION}`
const RUNTIME_CACHE = `ardhi-runtime-${VERSION}`
const API_CACHE = `ardhi-api-${VERSION}`

const APP_SHELL = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// ── INSTALL — pre-cache the app shell ──────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

// ── ACTIVATE — clean up old cache versions ──────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('ardhi-') && ![STATIC_CACHE, RUNTIME_CACHE, API_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ── FETCH ────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // API calls — network-first, cache fallback, never cache mutations
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request))
    return
  }

  // Navigations (page loads) — network-first, offline page fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request))
    return
  }

  // Static assets (JS/CSS/images/fonts) — cache-first, network fallback
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirstStatic(request))
    return
  }

  // Default — network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})

async function networkFirstAPI(request) {
  const cache = await caches.open(API_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    const cached = await cache.match(request)
    if (cached) return cached
    return new Response(
      JSON.stringify({ error: 'You are offline. Showing cached data where available.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

async function navigationHandler(request) {
  try {
    const response = await fetch(request)
    const cache = await caches.open(RUNTIME_CACHE)
    cache.put(request, response.clone())
    return response
  } catch (err) {
    const cache = await caches.open(RUNTIME_CACHE)
    const cached = await cache.match(request)
    if (cached) return cached
    const offline = await caches.match('/offline')
    return offline || new Response('Offline', { status: 503 })
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (err) {
    return new Response('', { status: 503 })
  }
}

// ── PUSH NOTIFICATIONS (ready for future use) ───────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title || 'The Ardhi', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      data: data.url ? { url: data.url } : undefined,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(self.clients.openWindow(url))
})
