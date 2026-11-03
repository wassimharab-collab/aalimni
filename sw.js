const CACHE = "aalimni-v2";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  // Drop any caches from a previous version so nothing stale lingers.
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
  await self.clients.claim();
})()));

// Stratégie simple : réseau d'abord, puis cache si hors-ligne.
// Suffisant pour être "installable" ; pas une vraie stratégie offline complète.
// { cache: "no-store" } force à ignorer le cache HTTP du navigateur, pour que
// "réseau d'abord" aille vraiment chercher la dernière version déployée au
// lieu de servir une réponse HTTP mise en cache (ex: GitHub Pages renvoie
// Cache-Control: max-age=600 sur les fichiers statiques).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const response = await fetch(event.request, { cache: "no-store" });
        cache.put(event.request, response.clone());
        return response;
      } catch (err) {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        throw err;
      }
    })
  );
});
