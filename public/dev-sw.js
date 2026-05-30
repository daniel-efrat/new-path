self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.unregister) {
        await self.registration.unregister();
      }

      if (self.caches?.keys) {
        const cacheNames = await self.caches.keys();
        await Promise.all(cacheNames.map((name) => self.caches.delete(name)));
      }

      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
