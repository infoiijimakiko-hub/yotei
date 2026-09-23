// 入口ページを端末に保存しておき、ホーム画面のアイコンから一瞬で開けるようにする。
// アプリ本体（Apps Script）には手を出さない（ここで扱うのはこの入口ページのファイルだけ）
const CACHE = 'yotei-launcher-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'maskable-512.png', 'favicon-48.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 古い版の保存分を消す
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (new URL(e.request.url).origin !== location.origin) return; // アプリ本体など、よその通信は素通し
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
