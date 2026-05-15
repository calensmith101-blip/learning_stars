const CACHE = "family-learning-stars-v2";
const ASSETS = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/lambo.jpg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const cloned = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, cloned));
      return response;
    }).catch(() => caches.match("/")))
  );
});
