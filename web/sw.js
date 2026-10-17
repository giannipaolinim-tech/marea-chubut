// Offline support: the whole app (code, data, tide tables, images) is cached on install.
// Open-Meteo is network-first with cache fallback. Run tools/build_precache.py after edits.
const VERSION = '6161c73be5a5'; // stamped by tools/build_precache.py
const PREFIX = 'marea-chubut-';
const RUNTIME = 'marea-chubut-runtime';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const res = await fetch('precache.json', { cache: 'no-store' });
    const { version, files } = await res.json();
    const cache = await caches.open(PREFIX + version);
    // cache: 'reload' bypasses the browser HTTP cache, so an update never stores stale files.
    await cache.addAll(files.map((f) => new Request(f, { cache: 'reload' })));
    await cache.put('precache.json', new Response(JSON.stringify({ version, files })));
    // Wait for the page to confirm ("Recargar") before taking over, unless this is the first install.
    if (!self.registration.active) self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const { version } = await (await fetch('precache.json', { cache: 'no-store' })).json();
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== PREFIX + version && k !== RUNTIME).map((k) => caches.delete(k)));
    } catch {
      // Offline during activation: keep old caches, clean up next time.
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  if (url.hostname.endsWith('open-meteo.com')) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME);
      try {
        const res = await fetch(event.request);
        if (res.ok) cache.put(event.request, res.clone());
        return res;
      } catch {
        return (await cache.match(event.request)) || Response.error();
      }
    })());
    return;
  }

  if (url.origin === self.location.origin && url.pathname.includes('/img/species/')) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME);
      const hit = await cache.match(event.request);
      if (hit) return hit;
      try {
        const res = await fetch(event.request);
        if (res.ok) cache.put(event.request, res.clone());
        return res;
      } catch {
        return Response.error();
      }
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(event.request, { ignoreSearch: true });
      if (cached) return cached;
      try {
        return await fetch(event.request);
      } catch {
        return (await caches.match('./')) || Response.error();
      }
    })());
  }
});
