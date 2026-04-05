/* ====================================================
   Service Worker — 週刊 AI実験ノート
   オフライン対応キャッシュ
==================================================== */
const CACHE_NAME = 'ai-note-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json'
];

/* インストール時にキャッシュ */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* 古いキャッシュを削除 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ネットワーク優先 → 失敗したらキャッシュ */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
