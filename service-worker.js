const CACHE_NAME = "quiz-app-cache-v3"; // ⚡ incrémente la version quand tu modifies ton code
const urlsToCache = [
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// === INSTALLATION ===
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // ⚡ active la nouvelle version immédiatement
});

// === ACTIVATION ===
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Suppression ancien cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// === FETCH (Network First, fallback cache) ===
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request) // 🔍 essaie d'abord d'aller sur le réseau
      .then(response => {
        // Si succès → on met à jour le cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() =>
        // ⚠️ si offline → cherche dans le cache
        caches.match(event.request).then(response => {
          if (response) return response;
          // fallback uniquement pour les pages HTML
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        })
      )
  );
});
