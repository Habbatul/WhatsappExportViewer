self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('my-pwa-cache-v2').then(function(cache) {
        return cache.addAll([
          '',
          '../index.html',
          'register.js',
          '../asset/icon.png',
          '../asset/iconBig.png',
          '../jquery/datepicker.js',
          '../jquery/jquery-3.7.1.min.js',
          '../main/datepicker.css',
          '../main/style.css',
          '../main/main.js',
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  