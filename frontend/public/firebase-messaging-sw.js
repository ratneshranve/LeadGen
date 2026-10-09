/* LeadGen push notification service worker.
 *
 * FCM delivers web pushes as standard Push API events with a JSON payload:
 *   { notification: { title, body }, data: { ...custom keys } }
 * This worker shows every push itself (foreground and background), so the page
 * does not also need a Firebase onMessage handler.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { notification: { title: "LeadGen", body: event.data ? event.data.text() : "" } };
  }

  const notification = payload.notification || {};
  const data = payload.data || {};

  event.waitUntil(
    self.registration.showNotification(notification.title || "LeadGen", {
      body: notification.body || "",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: data.notificationId || undefined,
      data,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Salespeople land in the sales app, everyone else in the admin panel
  const data = event.notification.data || {};
  const targetPath = data.portal === "sales" ? "/sales/notifications" : "/admin/notifications";
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
