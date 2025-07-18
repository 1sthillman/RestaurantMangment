# Restaurant QR - Garson Çağırma Sistemi

Bu proje, restoranlarda müşterilerin QR kod kullanarak garson çağırmasını sağlayan bir sistemdir. Mevcut adisyon uygulamasına entegre olarak çalışır.

## Özellikler

- Her masa için özel QR kod oluşturma
- Müşteriler QR kodu okutarak garson çağırabilme
- Garson panelinde anlık bildirimler
- Garson çağrılarına yanıt verme
- Masa bazında çağrı durumu takibi
- Supabase ile gerçek zamanlı veri senkronizasyonu

## Kurulum

### Gereksinimler
- Supabase hesabı (ücretsiz plan yeterlidir)
- Web sunucusu veya GitHub Pages

### Adımlar

1. Supabase veritabanını ayarlayın (`supabase-setup.md` dosyasını takip edin)
2. Dosyaları web sunucunuza veya GitHub Pages'e yükleyin
3. `js/qr-handler.js` ve `js/waiter-call-handler.js` dosyalarındaki Supabase URL ve API anahtarlarını güncelleyin
4. QR kodları oluşturup masalara yerleştirin

## Kullanım

1. **Müşteri için**: 
   - Masadaki QR kodu okutun
   - "Garsonu Çağır" butonuna basın
   - Garson yanıt verdiğinde bildirim alırsınız

2. **Garson için**:
   - Adisyon sisteminde garson hesabınıza giriş yapın
   - Garson çağrısı yapılan masalar kırmızı renkte görünür
   - Çağrıyı "Yanıtla" butonuyla cevaplayın

## Dosya Yapısı

- `qr.html`: QR kodu okutulduğunda açılan sayfa
- `js/qr-handler.js`: QR kod işleyici JavaScript
- `js/waiter-call-handler.js`: Garson çağrı sistemi için yardımcı fonksiyonlar
- `supabase-setup.md`: Supabase kurulum talimatları

## GitHub Pages Üzerinde Ücretsiz Barındırma

Projeni GitHub Pages üzerinde ücretsiz olarak barındırabilirsiniz:

1. GitHub repository'yi oluşturun
2. Dosyaları repository'ye yükleyin
3. Settings > Pages üzerinden GitHub Pages'i etkinleştirin
4. Main branch ve root dizini seçin

## Lisans

MIT

## Notlar

- Bu proje şu anda yalnızca frontend tarafını içermektedir, gerçek bir uygulamada backend ve veritabanı entegrasyonu gereklidir.
- Uygulamanın yerel ağ üzerinden çalışabilmesi için WebSocket veya Firebase gibi gerçek zamanlı veri senkronizasyonu sağlayan teknolojiler kullanılmalıdır.
- Ödeme işlemleri demo amaçlıdır, gerçek uygulamada bir ödeme sistemi entegrasyonu gereklidir.