// Pocketful web: keeps the app's own files so it opens offline. It never touches anything outside /app/.
// The build (vite.config.ts) puts the full file list and its hash here, so the first visit is enough to work offline.
const FILES = ["/app/assets/index-BbW6ndYc.js","/app/assets/index-zkJyNiV-.css","/app/fonts/fredoka-600.ttf","/app/fonts/nunito-400.woff2","/app/fonts/nunito-600.woff2","/app/fonts/nunito-700.woff2","/app/fonts/nunito-800.woff2","/app/icon-192.png","/app/icon-512.png","/app/icon.svg","/app/","/app/manifest.webmanifest"]
const CACHE = 'pocketful-app-98ba41464318'
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())) })
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('pocketful-app-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url)
  if (e.request.method !== 'GET' || u.origin !== location.origin || !u.pathname.startsWith('/app/')) return
  // Opening the app at any address under /app/ is the same page (routes live in the #hash).
  const key = e.request.mode === 'navigate' ? '/app/' : e.request
  // Stale-while-revalidate: open instantly from the cache, refresh it in the background.
  e.respondWith(caches.open(CACHE).then(async (c) => {
    // ignoreVary: scripts and fonts are fetched in CORS mode, and a server may send "Vary: Origin" on the precached copies.
    const hit = await c.match(key, { ignoreSearch: e.request.mode === 'navigate', ignoreVary: true })
    const fresh = fetch(e.request).then((r) => { if (r.ok) c.put(key, r.clone()); return r }).catch(() => hit || Response.error())
    if (hit) { e.waitUntil(fresh.catch(() => {})); return hit }
    return fresh
  }))
})
