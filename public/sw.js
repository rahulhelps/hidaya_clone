// Minimal service worker for Hidayah: enables installable PWA + lets prayer
// reminders surface as system notifications, and focuses the app when tapped.
// (No offline caching yet - added in a later phase alongside Web Push.)

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Backend-delivered prayer reminders (Web Push). Fires even when the app/tab
// is closed - the browser's push service wakes the service worker.
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: "Hidayah", body: event.data ? event.data.text() : "" };
  }
  const title = payload.title || "Hidayah";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: payload.tag || "hidayah-prayer",
      data: { url: payload.url || "/prayer" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/prayer";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
