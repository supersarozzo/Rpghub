// RPG Hub service worker (made by make-ipad.py --site). It keeps every file below on the device.
// VERSION changes whenever any file changes, so a phone that has the old copy picks up the new one.
const VERSION = "4034b6326a";
const CACHE = "rpg-hub-" + VERSION;
const FILES = [
 "./",
 "Skippy-combos.pdf",
 "Skippy-exceptions.pdf",
 "Skippy-roleplay.pdf",
 "checklists.html",
 "combos.html",
 "creator.html",
 "exceptions.html",
 "guide.html",
 "index.html",
 "landscape/Skippy-abilities-landscape.pdf",
 "landscape/Skippy-combos-landscape.pdf",
 "landscape/Skippy-exceptions-landscape.pdf",
 "landscape/Skippy-extras-landscape.pdf",
 "landscape/Skippy-roleplay-landscape.pdf",
 "landscape/Skippy-sheet-landscape.pdf",
 "manifest.webmanifest",
 "roleplay.html",
 "rpg-icon-180.png",
 "rpg-icon-192.png",
 "rpg-icon-maskable.png",
 "rpg-icon.png",
 "sheet/Skippy-extra-pages.pdf",
 "sheet/skippy-extra.html",
 "sheet/skippy-portrait.png",
 "sheet/skippy-portrait.svg",
 "sheet/skippy-sheet.html",
 "skippy-ipad-b.html",
 "skippy-ipad.html",
 "skippy-iphone-b.html",
 "skippy-iphone.html",
 "skippy.html",
 "start-here.html"
];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return (k.indexOf("rpg-hub-") === 0 || k.indexOf("skippy-hub-") === 0) && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function ranged(req, res) {            // PDF viewers ask for byte ranges; answer them from the cached whole file
  var m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || "");
  if (!m || !res || res.status !== 200) return Promise.resolve(res);
  return res.arrayBuffer().then(function (buf) {
    var a = m[1] === "" ? Math.max(0, buf.byteLength - parseInt(m[2], 10)) : parseInt(m[1], 10);
    var z = m[1] === "" || m[2] === "" ? buf.byteLength - 1 : Math.min(parseInt(m[2], 10), buf.byteLength - 1);
    return new Response(buf.slice(a, z + 1), { status: 206, statusText: "Partial Content", headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
      "Content-Range": "bytes " + a + "-" + z + "/" + buf.byteLength, "Content-Length": String(z - a + 1) } });
  });
}
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return ranged(req, hit);
    return fetch(req).catch(function () {
      return req.mode === "navigate" ? caches.match("index.html") : Response.error();
    });
  }));
});
