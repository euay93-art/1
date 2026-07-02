const CACHE_NAME = 'casino-cache-v1';

self.addEventListener('install', event => {
    console.log('[Service Worker] 설치 완료');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] 활성화 완료');
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});