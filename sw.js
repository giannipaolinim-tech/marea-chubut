// Self-destroying service worker: replaces the old cache-first worker at the previous address,
// wipes its caches, unregisters itself and sends every open tab to the new address.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const c of clients) {
      const hash = new URL(c.url).hash;
      c.navigate('https://marea-chubut.github.io/' + hash).catch(() => {});
    }
  })());
});
