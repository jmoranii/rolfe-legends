// Rolfe Legends — service worker: play offline after the first visit.
// Shell (html/css/js) = network-first with cache fallback, so online players always
// get the newest deploy and offline players get the last one they had.
// Art + music = cache-first, filled lazily as they're fetched during play (the full
// asset set is ~40MB — precaching it all would punish the first visit; emoji/silence
// fallbacks already handle anything not yet cached when offline).
const CACHE = 'rolfe-legends-v2';
const SHELL = [
  './', 'index.html', 'style.css', 'manifest.json',
  'js/game.js', 'js/logic.js', 'js/ai.js', 'js/cards.js',
  'js/music.js', 'js/sfx.js', 'js/tutorial.js',
  'assets/ui/icon-192.png', 'assets/ui/icon-512.png', 'assets/ui/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const isAsset = url.pathname.includes('/assets/');
  if (isAsset) {
    // cache-first: art + music never change without a rename; fill the cache as we go
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => Response.error())) // offline + uncached → error → emoji/silence fallback
    );
  } else {
    // network-first: fresh code when online, last-known-good when offline
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
      )
    );
  }
});
