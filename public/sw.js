/*
 * No-op service worker.
 *
 * This site does NOT use a service worker. This file exists only to:
 *   1. stop the 404 noise from `GET /sw.js` (probed by browser extensions
 *      or a stale SW registered on this origin by a previous project), and
 *   2. self-unregister any such stale registration so it stops controlling
 *      pages and reloads clients onto the live network version.
 *
 * If nothing registers it, this code simply never runs — the file just
 * answers the probe with 200.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        for (const client of clients) {
          client.navigate(client.url);
        }
      } catch {
        /* nothing to clean up */
      }
    })()
  );
});
