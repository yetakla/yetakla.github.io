/* Yetakla service worker: sahifa — avval tarmoq, keyin kesh; kutubxona va shriftlar — kesh. */
const V = "yetakla-v1";
const CORE = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
const LIBS = ["https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-asm.js"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE).then(() => Promise.all(LIBS.map(u => c.add(new Request(u, { mode: "cors" })).catch(() => null))))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const CACHEABLE = /^https:\/\/(cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com\/firebasejs)\//;
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (r.mode === "navigate" && u.origin === location.origin) {
    if (/\/admin\.html$/.test(u.pathname)) return;
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put("./", cp)); return res; }).catch(() => caches.match("./")));
    return;
  }
  if (u.origin === location.origin || CACHEABLE.test(r.url)) {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
  }
});
