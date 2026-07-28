/// <reference lib="webworker" />

export type {};
declare const self: any;

self.addEventListener("push", (event: any) => {
  const data = event.data?.json() ?? {};
  
  const title = data.title || "MANTIS Update";
  const options = {
    body: data.body || "You have a new notification.",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    data: data.url || "/",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList: any[]) => {
      const url = event.notification.data;
      
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
