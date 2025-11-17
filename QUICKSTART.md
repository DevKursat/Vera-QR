# 🚀 VERA QR - Hızlı Başlangıç Rehberi

## 📋 Supabase Database Kurulumu (5 Dakika)

### Adım 1: Supabase Projesi Oluştur
1. [supabase.com](https://supabase.com) adresine git
2. **"New Project"** tıkla
3. Proje ismini gir: `veraqr`
4. Güçlü bir database şifresi belirle (kaydet!)
5. Region seç: **Europe West (London)**
6. **"Create new project"** tıkla (2-3 dakika bekle)

---

### Adım 2: Tek SQL Dosyası ile Tüm Veritabanını Kur ✨

1. Sol menüden **"SQL Editor"** seçeneğine tıkla
2. **"New query"** butonuna tıkla
3. `supabase/migrations/00_complete_schema.sql` dosyasını aç
4. **Tüm içeriği kopyala** (Ctrl+A, Ctrl+C)
5. SQL Editor'e **yapıştır** (Ctrl+V)
6. **"Run"** (F5) butonuna tıkla veya Ctrl+Enter
7. ✅ **"Success"** mesajı görmelisiniz!

#### 🎉 Bu Kadar! Tek Dosyada Ne Var?

- ✅ **16 Tablo**: organizations, menu_items, orders, reviews, coupons, loyalty, vb.
- ✅ **40+ Index**: Hızlı sorgular için optimize edilmiş
- ✅ **20+ RLS Policy**: Row Level Security (multi-tenant güvenlik)
- ✅ **Triggers**: Otomatik updated_at güncellemeleri
- ✅ **Hata Koruması**: `IF NOT EXISTS` ile güvenli, defalarca çalıştırılabilir

> 💡 **Hata Alırsanız:** SQL dosyasının sonuna kadar scroll edip Success görün. "relation already exists" uyarıları normaldir (IF NOT EXISTS çalışıyor demek).

---

### Adım 3: Storage Buckets Oluştur

1. Sol menüden **"Storage"** tıkla
2. İki bucket oluştur:

#### Bucket 1: `organizations`
- **Name**: `organizations`
- **Public bucket**: ✅ İşaretle
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/png, image/jpeg, image/jpg, image/svg+xml`
- "Create bucket" tıkla

#### Bucket 2: `menu-items`
- **Name**: `menu-items`
- **Public bucket**: ✅ İşaretle
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/png, image/jpeg, image/jpg`
- "Create bucket" tıkla

---

### Adım 4: API Keys Al

1. Sol menüden **"Project Settings"** > **"API"** git
2. Şu 3 değeri kopyala (bir yere kaydet):

```
Project URL: https://xxxxxx.supabase.co
anon/public key: eyJhbGc...
service_role key: eyJhbGc... (GİZLİ TUT!)
```

---

## 🔑 OpenAI API Key Al

1. [platform.openai.com](https://platform.openai.com) adresine git
2. Hesap aç / giriş yap
3. Sol menüden **"API keys"** tıkla
4. **"Create new secret key"** tıkla
5. İsim ver: `vera-qr-production`
6. Key'i kopyala: `sk-...` (bir daha gösterilmez!)
7. **Billing** > **Add payment method** ile kart ekle
8. Minimum $5 yükle (uzun süre yeter)

---

## 💻 Yerel Geliştirme (Opsiyonel)

```bash
# Repository'yi klonla
git clone https://github.com/DevKursat/Vera-QR.git
cd Vera-QR

# Dependencies yükle
npm install

# .env.local oluştur
cp .env.local.example .env.local

# .env.local'i düzenle (Supabase ve OpenAI keys ekle)
# Sonra development server başlat
npm run dev
```

Tarayıcıda aç: `http://localhost:3000`

---

## 🚀 Vercel'e Deploy Et

### 1. GitHub'a Push
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Vercel'e Import
1. [vercel.com](https://vercel.com) adresine git
2. GitHub ile giriş yap
3. **"New Project"** > Repository'ni seç
4. **"Import"** tıkla

### 3. Environment Variables Ekle

Vercel'de **"Environment Variables"** bölümüne şunları ekle:

```env
# Supabase (ZORUNLU)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI (ZORUNLU - Platform Varsayılanı)
OPENAI_API_KEY=sk-...

# App Config (ZORUNLU)
NEXT_PUBLIC_APP_URL=https://vera-qr.vercel.app
PLATFORM_ADMIN_EMAIL=admin@yourcompany.com

# Google Maps (OPSİYONEL)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

> 💡 **Not**: `OPENAI_API_KEY` platform varsayılanıdır. Her restoran kendi key'ini de girebilir (admin panelde).

### 4. Deploy Tıkla!

- Build başlar (3-5 dakika)
- ✅ Deploy başarılı: `https://vera-qr.vercel.app`

### 5. GitHub Actions Health Check (OPSİYONEL)

1. GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** tıkla:
   - **Name**: `APP_URL`
   - **Value**: `https://vera-qr.vercel.app` (Vercel URL'in)
3. ✅ Her 5 dakikada otomatik health check çalışır
4. **Actions** tab'ında durumu görebilirsin

---

## 👤 İlk Platform Admin Kullanıcı Oluştur

### 1. Supabase'de User Oluştur
1. Supabase > **"Authentication"** > **"Users"**
2. **"Add user"** > **"Create new user"**
3. Email: `admin@yourcompany.com`
4. Password: Güçlü bir şifre
5. **"Auto Confirm User"**: ✅ İşaretle
6. **"Create user"** tıkla
7. Oluşturulan user'ın **UUID'sini kopyala**

### 2. Platform Admin Yetkisi Ver
1. Supabase > **"SQL Editor"** > **"New query"**
2. Şu SQL'i çalıştır (UUID'yi yapıştır):

```sql
-- UUID'yi buraya yapıştır
INSERT INTO platform_admins (user_id, is_super_admin, email, full_name)
VALUES (
  'USER_UUID_BURAYA',  -- UUID'yi buraya
  true,                 -- Super admin yetkisi
  'admin@yourcompany.com',
  'Platform Admin'
);
```

3. **"Run"** tıkla
4. ✅ Success mesajı görmelisiniz

---

## ✅ Test Et!

### 1. Login
- Tarayıcıda aç: `https://vera-qr.vercel.app/auth/login`
- Admin email/password ile giriş yap
- ✅ `/admin/dashboard` sayfasına yönlendirilmelisiniz

### 2. İlk Restoran Ekle
1. **"Yeni İşletme Ekle"** tıkla
2. Form doldur:
   - İşletme Adı: Test Restoran
   - Slug: test-restoran
   - Adres gir
   - Marka rengi seç
   - AI personality: Friendly
   - **OpenAI API Key**: Boş bırak (platform varsayılanı kullanır) veya restoranın kendi key'ini gir
3. **"Kaydet"** tıkla

### 3. QR Kod Test
1. **"Masalar & QR"** menüsü
2. QR kod oluştur
3. Telefon kamerası ile okut
4. ✅ Menü sayfası açılmalı: `https://vera-qr.vercel.app/test-restoran?table=1`

---

## 📚 Önemli Belgeler

- **`DEPLOYMENT.md`**: Detaylı deployment rehberi
- **`FEATURES_COMPLETE.md`**: Tüm özellikler listesi
- **`PRODUCTION_CHECKLIST.md`**: Canlıya almadan önce kontrol listesi
- **`supabase/migrations/00_complete_schema.sql`**: Tek SQL dosyası (tüm veritabanı)

---

## 🆘 Sorun mu Var?

### Build Hatası
```bash
npm run build  # Yerel olarak test et
npm run type-check  # TypeScript hatalarını kontrol et
```

### Supabase Bağlantı Hatası
- API keys doğru mu?
- Supabase projesi "Active" durumda mı?
- RLS policies çalışıyor mu?

### OpenAI Hatası
- API key geçerli mi?
- Bakiye yeterli mi?
- Rate limit aşıldı mı?

---

## 🎉 Tebrikler!

VERA QR artık canlıda! Müşterileriniz QR kod ile menüye ulaşabilir, AI asistan ile sohbet edebilir ve sipariş verebilir.

**Özellikler:**
- ✅ QR Menü Sistemi
- ✅ AI Asistan (GPT-4)
- ✅ Sipariş Yönetimi
- ✅ Masa Çağrı Sistemi
- ✅ Değerlendirme Sistemi
- ✅ Sadakat Programı
- ✅ Kupon Yönetimi
- ✅ Analytics Dashboard
- ✅ Webhook Entegrasyonu
- ✅ Multi-tenant (Her restoran izole)

---

<div align="center">

**🚀 Başarılı Bir Launch Dileriz! 🎊**

</div>
