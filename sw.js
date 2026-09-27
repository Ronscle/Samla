/* ============================================================
   Samla — service worker
   App-shell precache + runtime cache so the app opens offline
   once it has been loaded once (incl. fonts & the React/Babel CDN).
   ============================================================ */
const VERSION = "samla-v3";
const SHELL = VERSION + "-shell";
const RUNTIME = VERSION + "-runtime";

// Same-origin app shell (relative to this SW's scope).
const SHELL_ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "icons.jsx",
  "data.jsx",
  "shared.jsx",
  "home.jsx",
  "compose.jsx",
  "detail.jsx",
  "screens.jsx",
  "actions.jsx",
  "onboarding.jsx",
  "app.jsx",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "icons/icon-32.png"
];

// Cross-origin libs & fonts — opportunistic precache (won't fail install if blocked).
const CDN_ASSETS = [
  "https://unpkg.com/react@18.3.1/umd/react.development.js",
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js",
  "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(SHELL_ASSETS).catch(() => {});
    await Promise.allSettled(CDN_ASSETS.map((u) => cache.add(u)));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigation requests -> network first, fall back to the cached shell offline.
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(SHELL);
        cache.put("index.html", res.clone()).catch(() => {});
        return res;
      } catch (err) {
        return (await caches.match("index.html")) || (await caches.match("./")) || Response.error();
      }
    })());
    return;
  }

  // Same-origin app assets (html/css/jsx/icons) -> network first so edits always win;
  // cache the fresh copy and fall back to it when offline.
  if (sameOrigin) {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) {
          const cache = await caches.open(RUNTIME);
          cache.put(req, res.clone()).catch(() => {});
        }
        return res;
      } catch (err) {
        return (await caches.match(req)) || Response.error();
      }
    })());
    return;
  }

  // Cross-origin libs & fonts (versioned, immutable) -> cache first.
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === "opaque")) {
        const cache = await caches.open(RUNTIME);
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    } catch (err) {
      return cached || Response.error();
    }
  })());
});
