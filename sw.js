const CACHE_NAME = 'omar-mar-de-sangue-pwa-v06';
const ASSETS = ['./Game.js', './README.txt', './assets/islands/island_daegon.png', './assets/islands/island_demeter.png', './assets/islands/island_monastery.png', './assets/islands/island_reef.png', './assets/islands/island_ruin.png', './assets/islands/island_wreck.png', './assets/items/treasure_chest.png', './assets/items/treasure_coin.png', './assets/items/treasure_crate.png', './assets/menu_bg.png', './assets/sprites/enemy_court_ship.png', './assets/sprites/enemy_galleon.png', './assets/sprites/enemy_ram.png', './assets/sprites/player_ship.png', './assets/tiles/sea_base.png', './assets/tiles/sea_blood.png', './assets/tiles/sea_foam.png', './assets/tiles/sea_mist.png', './icons/icon-192.png', './icons/icon-512.png', './index.html', './manifest.webmanifest', './phaser.min.js', './style.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
