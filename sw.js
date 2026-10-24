// Cedolino: funzionamento senza connessione. Cambia V per forzare l'aggiornamento della cache.
const V = "cedolino-v1";
const CORE = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
const CDN = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE).then(() => Promise.all(CDN.map(u => c.add(u).catch(() => {}))))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url), same = u.origin === location.origin;
  if (same && (r.mode === "navigate" || u.pathname.endsWith(".html") || u.pathname.endsWith("/"))) {
    // pagina: prima la rete (per ricevere gli aggiornamenti), poi la copia salvata
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match("index.html"))));
    return;
  }
  if (same || u.hostname === "cdnjs.cloudflare.com") {
    // icone e lettore PDF: prima la copia salvata
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
      if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); }
      return res;
    })));
  }
});
