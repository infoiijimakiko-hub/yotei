// 画面を端末に保存しておき、ホーム画面のアイコンから一瞬で開けるようにする（build_web.js が sw.js に書き出す）。
// 開くときは保存してある画面をすぐ出し、裏でGitHubから新しい版を取ってきて保存し直す（次に開いたときに反映）。
// データのやり取り（Googleの窓口）には手を出さない。
const CACHE = 'yotei-app-20260927112157';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'maskable-512.png', 'favicon-48.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 古い版の保存分を消す
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return; // Googleとの通信などは素通し
  // 画面を開くとき（?launch=1 などが付いていても）は index.html として扱う
  const key = e.request.mode === 'navigate' ? new URL('index.html', self.registration.scope).href : url.origin + url.pathname;
  e.respondWith(caches.open(CACHE).then(cache => cache.match(key).then(hit => {
    const fresh = fetch(e.request, { cache: 'no-cache' }).then(r => {
      if (r.ok) cache.put(key, r.clone());
      return r;
    });
    if (hit) {
      e.waitUntil(fresh.catch(() => {})); // 保存分をすぐ返し、裏で新しい版を保存し直す
      return hit;
    }
    return fresh;
  })));
});
