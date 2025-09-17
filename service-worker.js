const CACHE_NAME = "quiz-app-cache-v2"; // ⚡ change de version pour forcer la maj
const urlsToCache = [
  "/Testo.html",          // ton fichier principal
  "/manifest.json",       // manifest PWA
  "/icons/icon-192.png",  // icône PWA
  "/icons/icon-512.png"   // icône PWA
];

// === INSTALLATION ===
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // ⚡ active immédiatement la nouvelle version
});

// === ACTIVATION ===
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // ⚡ prend le contrôle immédiatement
});

// === FETCH (Offline + Cache First) ===
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si trouvé dans le cache → on le renvoie
      if (response) return response;

      // Sinon on tente le réseau
      return fetch(event.request).catch(() => {
        // ⚠️ fallback offline uniquement pour les navigations (HTML)
        if (event.request.mode === "navigate") {
          return caches.match("/testo.html");
        }
      });
    })
  );
});