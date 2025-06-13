# QR Kod ile Garson Çağırma Sistemi - Supabase Kurulum Kılavuzu

Bu doküman, QR kod ile garson çağırma sistemi için Supabase kurulumunu detaylı olarak anlatmaktadır.

## 1. Supabase Hesabı ve Proje Oluşturma

1. [Supabase](https://supabase.com/) sitesine giderek ücretsiz bir hesap oluşturun.
2. Hesabınıza giriş yaptıktan sonra "New project" butonuna tıklayın.
3. Projenize bir isim verin (örn. "restaurant-app-qr").
4. Bir veritabanı şifresi belirleyin (bu şifreyi güvenli bir yerde saklayın).
5. Bölge seçin (sizin konumunuza en yakın bölgeyi seçmeniz önerilir).
6. "Create new project" butonuna tıklayarak projenizi oluşturun.

## 2. Veritabanı Tablosunu Oluşturma

Supabase projesi oluşturulduktan sonra, SQL Editörüne giderek aşağıdaki kodu çalıştırın:

```sql
-- Garson çağrıları tablosu
CREATE TABLE waiter_calls (
  id SERIAL PRIMARY KEY,
  table_number INTEGER NOT NULL,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by TEXT
);

-- Supabase Realtime için yayınlama ayarı
ALTER PUBLICATION supabase_realtime ADD TABLE waiter_calls;

-- Waiter Calls tablosu oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION create_waiter_calls_table()
RETURNS BOOLEAN AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS waiter_calls (
    id SERIAL PRIMARY KEY,
    table_number INTEGER NOT NULL,
    status TEXT DEFAULT 'waiting',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by TEXT
  );
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

## 3. Gerçek Zamanlı Kanallar Ayarı

1. Supabase Dashboard'dan "Realtime" sekmesine gidin.
2. "Enable Realtime" seçeneğini açın (eğer kapalıysa).
3. "Broadcast" ve "Presence" özelliklerini etkinleştirin.

## 4. API Anahtarlarını Alma

1. Supabase projenizdeki "Settings" > "API" sekmesine gidin.
2. "Project URL" ve "anon" (public) API anahtarını kopyalayın.
3. Bu bilgileri uygulamanızdaki ilgili JavaScript dosyalarında kullanacaksınız.

## 5. RLS (Row Level Security) Ayarları

Güvenlik için aşağıdaki RLS (Row Level Security) kurallarını ekleyin:

```sql
-- Waiter Calls için RLS etkinleştir
ALTER TABLE waiter_calls ENABLE ROW LEVEL SECURITY;

-- Anonim kullanıcılar için kurallar
CREATE POLICY "Anonim kullanıcılar yeni çağrı oluşturabilir" 
ON waiter_calls FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "Anonim kullanıcılar kendi çağrılarını görebilir" 
ON waiter_calls FOR SELECT TO anon
USING (true);

-- Gerçek kullanıcılar için kurallar (rol bazlı)
CREATE POLICY "Garsonlar tüm çağrıları görebilir" 
ON waiter_calls FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Garsonlar çağrıları yanıtlayabilir" 
ON waiter_calls FOR UPDATE TO authenticated
USING (status = 'waiting')
WITH CHECK (true);
```

## 6. GitHub Pages İle Barındırma

1. GitHub hesabınızda yeni bir repository oluşturun.
2. Uygulamanızı bu repository'ye push edin.
3. Repository'nin "Settings" sekmesine gidin.
4. Sol tarafta "Pages" seçeneğine tıklayın.
5. "Source" altında "main" branch'ini seçin ve "/root" klasörünü belirtin.
6. "Save" butonuna tıklayın.

GitHub Pages, repository'nizdeki kodları otomatik olarak derleyecek ve size bir URL verecektir. Bu URL üzerinden uygulamanıza internetten erişebileceksiniz.

## 7. QR Kod Yapılandırması

Her masa için, aşağıdaki formatta QR kodlar oluşturun:

```
https://[github-pages-url]/qr.html?table=[masa_numarasi]
```

Örnek:
```
https://username.github.io/restaurant-app/qr.html?table=42
```

Bu QR kodlar, müşteriler tarafından okutulduğunda ilgili masa numarasıyla bir garson çağırma sayfasına yönlendirecektir.

## 8. Test Etme

1. QR kodları yazdırın ve masalara yerleştirin.
2. Bir müşteri gözüyle QR kodu okutun ve garson çağırma butonuna basın.
3. Garson panelinde, çağrının doğru masada görünüp görünmediğini kontrol edin.
4. Çağrıya yanıt verin ve müşteri tarafında bildirimin göründüğünü doğrulayın. 