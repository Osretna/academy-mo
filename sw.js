// Simple offline-capable service worker for static hosting (GitHub Pages).
// Uses a "network-first, cache fallback" strategy for navigation requests
// and a "cache-first" strategy for static assets.

const CACHE_VERSION = "academy-v2";

self.addEventListener("install", (event) => {
  // Activate immediately on update
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Skip cross-origin requests (Firebase, Google Fonts, etc.)
  if (url.origin !== self.location.origin) return;

  // Navigation requests → network first, then cached index.html
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_VERSION);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE_VERSION);
          const cached = await cache.match(req);
          if (cached) return cached;
          // Fallback to index.html if navigating to a hash route
          const indexCached = await cache.match("./index.html");
          if (indexCached) return indexCached;
          return new Response("Offline", { status: 503 });
        }
      })(),
    );
    return;
  }

  // Static assets → cache first
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.status === 200) {
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        return cached || new Response("Offline", { status: 503 });
      }
    })(),
  );
});
