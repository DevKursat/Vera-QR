# 🚀 VERA QR - Deployment Rehberi

Bu rehber, VERA QR projesini sıfırdan canlıya almanız için adım adım talimatlar içerir.

---

## 📋 İçindekiler

1. [Ön Hazırlık](#1-ön-hazırlık)
2. [Supabase Kurulumu](#2-supabase-kurulumu)
3. [Vercel Deployment](#3-vercel-deployment)
4. [OpenAI Kurulumu](#4-openai-kurulumu)
5. [Google Maps (Opsiyonel)](#5-google-maps-opsiyonel)
6. [İlk Kullanıcı Oluşturma](#6-i̇lk-kullanıcı-oluşturma)
7. [Test ve Doğrulama](#7-test-ve-doğrulama)
8. [Domain Bağlama](#8-domain-bağlama)

---

## 1. Ön Hazırlık

### Gereksinimler
- [ ] Node.js 18+ yüklü
- [ ] GitHub hesabı
- [ ] Vercel hesabı (ücretsiz)
- [ ] Supabase hesabı (ücretsiz)
- [ ] OpenAI API key ($5 minimum bakiye)
- [ ] (Opsiyonel) Google Cloud hesabı

### Proje Klonlama

```bash
# Repository'yi klonlayın
git clone https://github.com/DevKursat/Vera-QR.git
cd Vera-QR

# Dependencies yükleyin
npm install
```

---

## 2. Supabase Kurulumu

### 2.1. Proje Oluşturma

1. **https://supabase.com** adresine gidin
2. "New Project" butonuna tıklayın
3. Bilgileri doldurun:
   - **Name**: vera-qr (veya istediğiniz isim)
   - **Database Password**: Güçlü bir şifre seçin (kaydedin!)
   - **Region**: Europe West (London) - size en yakın
   - **Pricing Plan**: Free

4. "Create new project" butonuna tıklayın (2-3 dakika sürer)

### 2.2. Database Migration (SQL Kodları)

Proje oluşturulduktan sonra:

1. Sol menüden **"SQL Editor"** seçeneğine tıklayın
2. **"New query"** butonuna tıklayın
3. Aşağıdaki dosyaları **SIRAYLA** çalıştırın:

#### ✅ Adım 1: İlk Schema
```sql
-- Dosya: supabase/migrations/20240101000000_initial_schema.sql
-- Bu dosyanın içeriğini kopyalayın ve SQL Editor'e yapıştırın
-- Run (F5) butonuna basın
```
**Ne yapar?** Organizations, menu_categories, menu_items, orders, tables gibi core tabloları oluşturur.

#### ✅ Adım 2: RLS Policies
```sql
-- Dosya: supabase/migrations/20240101000001_rls_policies.sql
-- Run (F5)
```
**Ne yapar?** Row Level Security politikalarını ekler, multi-tenant güvenliği sağlar.

#### ✅ Adım 3: Webhook System
```sql
-- Dosya: supabase/migrations/20240102000000_webhook_system.sql
-- Run (F5)
```
**Ne yapar?** Webhook entegrasyonu tablolarını oluşturur.

#### ✅ Adım 4: Auth & Features
```sql
-- Dosya: supabase/migrations/20240103000000_auth_and_features.sql
-- Run (F5)
```
**Ne yapar?** Authentication, AI settings, loyalty, coupons, reviews tablolarını ekler.

#### ✅ Adım 5: Extended RLS
```sql
-- Dosya: supabase/migrations/20240103000001_rls_policies_extended.sql
-- Run (F5)
```
**Ne yapar?** Yeni tablolar için RLS politikalarını ekler.

> 💡 **İpucu**: Her SQL dosyasını çalıştırdıktan sonra "Success" mesajı görmeli ve hata olmamalısınız. Hata alırsanız, önceki adımları kontrol edin.

### 2.3. Storage Buckets Oluşturma

1. Sol menüden **"Storage"** seçeneğine tıklayın
2. **"Create a new bucket"** butonuna tıklayın

#### Bucket 1: organizations
- **Name**: `organizations`
- **Public bucket**: ✅ İşaretleyin
- **File size limit**: 5 MB
- **Allowed MIME types**: image/png, image/jpeg, image/jpg, image/svg+xml
- "Create bucket" butonuna tıklayın

#### Bucket 2: menu-items
- **Name**: `menu-items`
- **Public bucket**: ✅ İşaretleyin
- **File size limit**: 5 MB
- **Allowed MIME types**: image/png, image/jpeg, image/jpg
- "Create bucket" butonuna tıklayın

### 2.4. API Keys Alma

1. Sol menüden **"Project Settings"** > **"API"** seçeneğine gidin
2. Aşağıdaki değerleri kopyalayın (bir yere kaydedin):

```
Project URL: https://xxxxxx.supabase.co
anon/public key: eyJhbGc...
service_role key: eyJhbGc... (gizli tutun!)
```

---

## 3. Vercel Deployment

### 3.1. Vercel Hesabı

1. **https://vercel.com** adresine gidin
2. "Sign Up" ile GitHub hesabınızla giriş yapın
3. GitHub repository'nize erişim izni verin

### 3.2. Proje Import

1. Vercel dashboard'da **"Add New"** > **"Project"** tıklayın
2. GitHub'dan **"Vera-QR"** repository'sini seçin
3. **"Import"** butonuna tıklayın

### 3.3. Environment Variables Ayarlama

**Configure Project** ekranında **"Environment Variables"** bölümüne şunları ekleyin:

```env
# Supabase (ZORUNLU)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI (ZORUNLU)
OPENAI_API_KEY=sk-...

# App Configuration (ZORUNLU)
NEXT_PUBLIC_APP_URL=https://vera-qr.vercel.app
PLATFORM_ADMIN_EMAIL=admin@yourcompany.com

# Webhook (ZORUNLU)
CRON_SECRET=your_random_secret_here_min_32_chars

# Google Maps (OPSİYONEL)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

> 💡 **İpucu**: Her satırı **Name** ve **Value** alanlarına ayrı ayrı girin. "Add" butonuna basarak her birini ekleyin.

### 3.4. Build Settings (Otomatik Algılar)

Vercel otomatik algılar, ancak kontrol edin:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3.5. Deploy

1. **"Deploy"** butonuna tıklayın
2. Build süreci başlar (3-5 dakika)
3. ✅ Build başarılı olursa, deployment URL'iniz verilir

```
🎉 https://vera-qr.vercel.app
```

---

## 4. OpenAI Kurulumu

### 4.1. API Key Alma

1. **https://platform.openai.com** adresine gidin
2. Hesap oluşturun / giriş yapın
3. Sol menüden **"API keys"** seçeneğine tıklayın
4. **"Create new secret key"** butonuna tıklayın
5. İsim verin: `vera-qr-production`
6. Key'i kopyalayın (bir daha gösterilmez!)

### 4.2. Bakiye Yükleme

1. **"Settings"** > **"Billing"** gidin
2. **"Add payment method"** ile kredi kartı ekleyin
3. Minimum $5 yükleyin (uzun süre yeter)

### 4.3. Kullanım Limiti

1. **"Usage limits"** bölümüne gidin
2. **"Hard limit"** ayarlayın: $10 (fazla harcamayı önler)
3. Email bildirimleri aktif edin

> 💰 **Maliyet Tahmini**: Orta büyüklükte restoran için ayda $2-5 arası

---

## 5. Google Maps (Opsiyonel)

Address autocomplete özelliği için gereklidir. Atlamak isterseniz, manuel adres girişi çalışır.

### 5.1. Google Cloud Console

1. **https://console.cloud.google.com** adresine gidin
2. Yeni proje oluşturun: "VERA-QR"
3. Billing aktif edin (kredi kartı gerekli, ama $200 ücretsiz kredi)

### 5.2. Places API Aktif Etme

1. Sol menüden **"APIs & Services"** > **"Library"**
2. "Places API" arayın ve tıklayın
3. **"Enable"** butonuna tıklayın

### 5.3. API Key Oluşturma

1. **"Credentials"** sekmesine gidin
2. **"Create Credentials"** > **"API Key"**
3. Key oluşturulur, **kopyalayın**

### 5.4. API Key Kısıtlama (Önemli!)

1. Oluşturulan key'e tıklayın
2. **"Application restrictions"**:
   - **HTTP referrers** seçin
   - Ekleyin:
     - `https://vera-qr.vercel.app/*`
     - `https://yourdomain.com/*`
3. **"API restrictions"**:
   - **Restrict key** seçin
   - Sadece **"Places API"** işaretleyin
4. **"Save"** tıklayın

### 5.5. Vercel'e Ekleme

1. Vercel dashboard > Projeniz > **"Settings"** > **"Environment Variables"**
2. Yeni variable ekleyin:
   - Name: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: `AIza...` (key'iniz)
3. **"Save"**
4. **"Redeploy"** ile projeyi yeniden deploy edin

---

## 6. İlk Kullanıcı Oluşturma

### 6.1. Platform Admin User

1. Supabase dashboard'a gidin
2. Sol menüden **"Authentication"** > **"Users"** tıklayın
3. **"Add user"** > **"Create new user"** tıklayın
4. Bilgileri doldurun:
   - **Email**: admin@yourcompany.com
   - **Password**: Güçlü bir şifre
   - **Auto Confirm User**: ✅ İşaretleyin
5. **"Create user"** tıklayın
6. Oluşturulan user'ın **UUID'sini kopyalayın** (örn: `abc123-def456...`)

### 6.2. Platform Admin Yetkisi Verme

1. Supabase'de **"SQL Editor"** > **"New query"**
2. Şu SQL'i çalıştırın:

```sql
-- User UUID'nizi buraya yapıştırın
INSERT INTO platform_admins (user_id, is_super_admin)
VALUES ('USER_UUID_BURAYA', true);
```

3. **Run (F5)** ile çalıştırın
4. "Success" mesajı görmelisiniz

---

## 7. Test ve Doğrulama

### 7.1. Login Test

1. Tarayıcıda açın: `https://vera-qr.vercel.app/auth/login`
2. Oluşturduğunuz admin hesabı ile giriş yapın
3. ✅ `/admin/dashboard` sayfasına yönlendirilmelisiniz

### 7.2. İlk Organization Oluşturma

1. Dashboard'da **"Yeni İşletme Ekle"** tıklayın
2. Form doldurun:
   - İşletme Adı: Test Restoran
   - Slug: test-restoran
   - Açıklama: Test amaçlı
   - Adres: Bir adres girin
   - Marka rengi seçin
   - AI personality: Friendly
3. **"Kaydet"** tıklayın

### 7.3. QR Kod Test

1. **"Masalar & QR"** menüsüne gidin
2. Bir masa için QR kod oluşturun
3. QR kodu indirin
4. Telefon kamerası ile QR'ı okutun
5. ✅ Menü sayfası açılmalı: `https://vera-qr.vercel.app/test-restoran?table=1`

### 7.4. Customer Flow Test

1. QR ile açılan sayfada:
   - Menüyü görüntüleyin
   - AI asistan ile sohbet edin
   - Sepete ürün ekleyin
   - Sipariş verin
2. Admin panelden:
   - **"Siparişler"** menüsünde sipariş görünmeli
   - Real-time güncelleme çalışmalı

---

## 8. Domain Bağlama

### 8.1. Domain Satın Alma

Önerilen servisler:
- **Namecheap** (ucuz, kolay)
- **GoDaddy** (popüler)
- **Cloudflare** (DNS + domain)

### 8.2. Vercel'e Domain Ekleme

1. Vercel dashboard > Projeniz > **"Settings"** > **"Domains"**
2. **"Add"** butonuna tıklayın
3. Domain'inizi girin: `veraqr.com`
4. **"Add"** tıklayın

### 8.3. DNS Ayarları

Vercel size DNS kayıtları gösterecek. Domain registrar'ınızda şunları ekleyin:

**A Record (Root domain)**:
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**CNAME (www subdomain)**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 8.4. SSL Sertifikası

- Vercel otomatik SSL sertifikası oluşturur
- 1-2 saat içinde `https://veraqr.com` hazır olur
- ✅ Yeşil kilit simgesi görmelisiniz

### 8.5. Environment Variable Güncelleme

1. Vercel > **"Settings"** > **"Environment Variables"**
2. `NEXT_PUBLIC_APP_URL` değerini güncelleyin:
   - Eski: `https://vera-qr.vercel.app`
   - Yeni: `https://veraqr.com`
3. **"Redeploy"** ile yeniden deploy edin

---

## 🎉 Tebrikler! Deployment Tamamlandı

Artık projeniz canlıda! Şu adreslerden erişebilirsiniz:

- 🌐 **Customer**: https://veraqr.com/[slug]
- 🔐 **Admin Login**: https://veraqr.com/auth/login
- 📊 **Platform Admin**: https://veraqr.com/admin/dashboard
- 🍽️ **Restaurant Admin**: https://veraqr.com/dashboard

---

## 🐛 Sorun Giderme

### Build Hatası

```bash
# Yerel olarak test edin
npm run build

# Hata varsa logları kontrol edin
# TypeScript hatalarını düzeltin
npm run type-check
```

### Supabase Bağlantı Hatası

- API keys doğru mu kontrol edin
- Supabase projesi "Active" durumda mı?
- RLS policies çalışıyor mu?

### OpenAI Hatası

- API key geçerli mi?
- Bakiye yeterli mi?
- Rate limit aşıldı mı?

### Google Maps Çalışmıyor

- API key doğru mu?
- Places API aktif mi?
- HTTP referrer kısıtlaması doğru mu?

---

## 📞 Destek

- **Documentation**: `/PRODUCTION_CHECKLIST.md`
- **GitHub Issues**: https://github.com/DevKursat/Vera-QR/issues
- **Email**: support@veraqr.com

---

## 🔄 Güncelleme Yapmak

Kod değişikliği yaptığınızda:

```bash
# Değişiklikleri commit edin
git add .
git commit -m "Özellik: Yeni özellik eklendi"
git push origin main

# Vercel otomatik deploy eder (1-2 dakika)
```

---

<div align="center">

**🚀 Başarılı Bir Launch Dileriz! 🎊**

</div>
