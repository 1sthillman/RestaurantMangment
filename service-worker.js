// Önbellek adı
const CACHE_NAME = 'restoran-app-v1';

// Önbelleğe alınacak dosyalar
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  // CDN kaynaklarını önbellekleme - CORS hatası nedeniyle dış kaynakları kaldırdık
  // 'https://cdn.tailwindcss.com/3.4.16',
  // 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap', 
  // 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  // 'https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.min.css',
  // 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6/dist/umd/supabase.min.js',
  './manifest.json',
  './img/icon-144x144.png'
];

// Service Worker Yükleme
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Önbellek açıldı');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Önbellek hatası:', err);
      })
  );
});

// Ağ isteklerini yakalama
self.addEventListener('fetch', (event) => {
  // Sadece GET isteklerini işle, diğer istekleri olduğu gibi bırak
  if (event.request.method !== 'GET') {
    return;
  }

  // CORS hatalarına neden olabilecek CDN isteklerini kontrol et
  if (event.request.url.includes('cdn.tailwindcss.com')) {
    // Bu istekleri servis worker üzerinden yapmadan direkt browser'a bırak
    return;
  }
  
  // Placeholder görüntüleri için yerel görüntü kullan
  if (event.request.url.includes('via.placeholder.com')) {
    event.respondWith(
      caches.match('./img/icon-72x72.png')
        .then(response => {
          if (response) {
            return response;
          }
          return fetch('./img/icon-72x72.png')
            .then(fetchResponse => {
              if (fetchResponse && fetchResponse.status === 200) {
                return fetchResponse;
              }
              return new Response('', { 
                status: 200, 
                headers: {'Content-Type': 'image/png'} 
              });
            })
            .catch(() => new Response('', { 
              status: 200, 
              headers: {'Content-Type': 'image/png'} 
            }));
        })
    );
    return;
  }
  
  // Ses dosyaları için hata yönetimi
  if (event.request.url.includes('waiter_call_sound.mp3')) {
    event.respondWith(
      caches.match('./www/sounds/waiter_call.mp3')
        .then(response => {
          if (response) {
            return response;
          }
          return fetch('./www/sounds/waiter_call.mp3')
            .then(fetchResponse => {
              if (fetchResponse && fetchResponse.status === 200) {
                return fetchResponse;
              }
              return new Response('', { 
                status: 200, 
                headers: {'Content-Type': 'audio/mpeg'} 
              });
            })
            .catch(() => new Response('', { 
              status: 200, 
              headers: {'Content-Type': 'audio/mpeg'} 
            }));
        })
    );
    return;
  }

  // İsteği cevapla
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Önbellekte varsa önbellekten döndür
        if (response) {
          return response;
        }
        
        // Eğer önbellekte yoksa, ağdan iste
        return fetch(event.request)
          .then((response) => {
            // Geçerli bir yanıt değilse doğrudan döndür
            if (!response) {
              return new Response('', { 
                status: 200, 
                headers: {'Content-Type': 'text/plain'} 
              });
            }
            
            if (response.status !== 200) {
              return response;
            }

            try {
              // Önbelleğe bir kopya ekle
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  // Sadece local kaynakları ve güvenli harici kaynakları önbelleğe al
                  if (event.request.url.startsWith(self.location.origin) || 
                      !event.request.url.includes('supabase') && 
                      !event.request.url.includes('cdn.')) {
                    cache.put(event.request, responseToCache)
                      .catch(err => console.error('Cache put hatası:', err));
                  }
                });
            } catch (err) {
              console.error('Önbellekleme hatası:', err);
            }

            return response;
          })
          .catch(err => {
            console.error('Fetch hatası:', err);
            
            // İnternet bağlantısı yoksa veya istek başarısız olursa
            // Eğer HTML istiyorsa offline sayfasını göster
            if (event.request.headers.get('accept') && 
                event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./offline.html')
                .catch(offlineErr => {
                  console.error('Offline sayfa hatası:', offlineErr);
                  return new Response('Çevrimdışısınız ve offline sayfası yüklenemedi.', {
                    headers: { 'Content-Type': 'text/plain' }
                  });
                });
            }
            
            // Diğer hatalar için boş yanıt
            return new Response('İçerik yüklenemedi', {
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
      .catch(err => {
        console.error('Cache match hatası:', err);
        return fetch(event.request).catch(() => {
          if (event.request.headers.get('accept').includes('text/html')) {
            return new Response('Çevrimdışısınız', {
              headers: { 'Content-Type': 'text/plain' }
            });
          }
        });
      })
  );
});

// Eski önbellekleri temizleme
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 