// XorazmUylar CRM Web Push service worker
const APP_URL = '/?admin=1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}

  const title = data.title || 'XorazmUylar CRM';
  const body = data.body || 'Yangi CRM xabari.';
  const url = data.url || APP_URL;
  const badgeCount = Math.max(1, Number(data.badge || 1));
  const tag = data.tag || 'xorazm-crm';

  event.waitUntil((async () => {
    const tasks = [
      self.registration.showNotification(title, {
        body,
        tag,
        renotify: true,
        data: { url },
        icon: '/logo-tel.PNG',
        badge: '/logo-tel.PNG'
      })
    ];

    if (self.navigator && 'setAppBadge' in self.navigator) {
      try { tasks.push(self.navigator.setAppBadge(badgeCount)); } catch (_) {}
    }

    await Promise.all(tasks);
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || APP_URL, self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      try { await client.navigate(target); } catch (_) {}
      if ('focus' in client) return client.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
  })());
});
