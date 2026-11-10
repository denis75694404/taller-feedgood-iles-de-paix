/* Caché del portal del taller Feed Good: abre rápido en el celular y resiste un wifi débil.
   - Páginas (HTML): primero la red (siempre la versión más reciente); sin conexión o si tarda más de 3,5 s, la copia guardada.
   - Estilos, scripts, fotos e íconos propios: se muestran desde la copia guardada y se actualizan en segundo plano.
   - Librerías de CDN con versión fija y fuentes: se guardan una vez.
   - Firebase (datos en vivo) nunca se guarda. */
const VERSION = "taller-feedgood-2026-11-10a";
const PRECACHE = ["./", "index.html", "assets/app.css", "assets/app.js", "assets/data.js", "assets/creditos.js", "img/idp-paisaje.jpg", "img/idp-yunta.jpg", "img/idp-vivero.jpg", "img/logo_idp.png", "img/logo_idp_blanco.png",
  "herramientas/herramienta.html", "trabajemos-juntos/grupos.html", "trabajemos-juntos/fbconfig.js", "trabajemos-juntos/img/grupo.jpg", "trabajemos-juntos/img/administrador-icono.jpg"];
const CDN = /^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com\/firebasejs)\//;
const NUNCA = /firestore\.googleapis|identitytoolkit|securetoken|googleapis\.com\/(?!css)|arcgisonline|arcgis\.com|firebaseinstallations/;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = r.url;
  if (r.method !== "GET" || NUNCA.test(u) || u.startsWith("chrome-extension") || /\/sw\.js(\?|$)/.test(u)) return;
  const html = r.mode === "navigate" || (r.headers.get("accept") || "").includes("text/html");
  if (html) {                                   // red primero, revalidando siempre con el servidor (sin caché HTTP del navegador)
    const guardada = () => caches.match(r, { ignoreSearch: true });
    const red = fetch(r, { cache: "no-cache" }).then(res => { const cp = res.clone(); if (res.ok) caches.open(VERSION).then(c => c.put(r, cp)); return res; })
      .catch(() => guardada().then(m => m || caches.match("./")));
    // wifi lento: a los 3,5 s abre la copia guardada (la red la actualiza para la próxima vez)
    const lenta = new Promise(ok => setTimeout(ok, 3500)).then(guardada).then(m => m || red);
    e.respondWith(Promise.race([red, lenta]));
    return;
  }
  if (CDN.test(u)) {                            // caché primero (versiones fijas)
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); } return res; })));
    return;
  }
  if (new URL(u).origin === self.location.origin) {   // copia guardada y actualización en segundo plano
    e.respondWith(caches.open(VERSION).then(c => c.match(r).then(m => {
      const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => m);
      return m || net;
    })));
  }
});
