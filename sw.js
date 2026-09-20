const CACHE_NAME = 'timer-tir-v1';

// Liste de tous les fichiers à sauvegarder dans le téléphone
const urlsToCache = [
  './index.html',
  './CSS/global.css',
  './JavaScript/app.js',
  // On cache aussi tous tes sons pour le mode hors-ligne !
  './MP3/4sec.mp3',
  './MP3/6sec.mp3',
  './MP3/8sec.mp3',
  './MP3/10secEntrainement.mp3',
  './MP3/10secMatch.mp3',
  './MP3/20sec.mp3',
  './MP3/37.mp3',
  './MP3/150sec.mp3',
  './MP3/P25Standard.mp3',
  './MP3/Vitesse Olympique.mp3'
];

// Installation : on met tout en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Fichiers mis en cache avec succès');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interception des requêtes : on sert le cache si on n'a pas internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // On retourne le fichier en cache s'il existe, sinon on va sur le réseau
        return response || fetch(event.request);
      })
  );
});