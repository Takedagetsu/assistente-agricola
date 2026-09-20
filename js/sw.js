const CACHE_NAME = 'agromanejo-v5';
const ARQUIVOS_CACHE = [
    '/',
    '/login.html',
    '/principal.html',
    '/Styles/estilos.css',
    '/Styles/responsivo.css',
    '/js/db.js',
    '/js/usuarios.js',
    '/js/auth.js',
    '/js/app.js'
];

self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS_CACHE))
    );
});

self.addEventListener('fetch', (evento) => {
    evento.respondWith(
        caches.match(evento.request).then(resposta => {
            return resposta || fetch(evento.request);
        })
    );
});