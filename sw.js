const CACHE_NAME = "sistema-pos-v2"; // Cambié a v2 para futuras actualizaciones
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-50.png",
  "./icon-96png",
  "./icon-144.png",
  "./icon-2.png",
  "./icon.png"
];

// ===== Instalación: cache de archivos =====
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Activa el SW inmediatamente
});

// ===== Activación: borrar cachés antiguos =====
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      )
    )
  );
  self.clients.claim(); // Controla todas las páginas abiertas
});

// ===== Fetch: responder desde cache o red =====
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
