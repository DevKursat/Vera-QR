# 🔗 Webhook CRM Entegrasyonu

VERA-QR artık **Webhook sistemi** ile herhangi bir CRM/ERP sistemine sipariş verilerini otomatik olarak gönderebilir.

## 🎯 Özellikler

### ✅ Temel Fonksiyonlar
- **Webhook Yapılandırması**: Her restoran kendi webhook endpoint'lerini tanımlayabilir
- **Event Subscriptions**: `order.created`, `order.updated`, `order.completed`, `order.cancelled`
- **HMAC İmzalama**: Her webhook isteği güvenli SHA256 imzası ile gönderilir
- **Otomatik Retry**: Başarısız istekler için 3 denemeye kadar otomatik tekrar (1dk, 5dk, 30dk)
- **Delivery Logs**: Tüm webhook gönderimlerinin detaylı kaydı
- **Test Endpoint**: Webhook'ları canlıya almadan önce test edebilme

### 🔐 Güvenlik
- Secret key ile HMAC-SHA256 imzalama
- X-Webhook-Signature header'ı ile doğrulama
- HTTPS zorunluluğu (production'da)
- Custom headers desteği (API keys, auth tokens, vb.)

---

## 📊 Veritabanı Şeması

### `webhook_configs` Tablosu
```sql
- id (UUID)
- organization_id (UUID) → her restoran için
- name (VARCHAR) → "Salesforce CRM", "Custom API", vb.
- url (TEXT) → webhook endpoint URL'i
- secret_key (TEXT) → HMAC imzalama için
- events (JSONB) → ["order.created", "order.updated", ...]
- is_active (BOOLEAN)
- retry_enabled (BOOLEAN)
- max_retries (INTEGER)
- timeout_seconds (INTEGER)
- custom_headers (JSONB) → {"X-API-Key": "...", ...}
- last_triggered_at (TIMESTAMPTZ)
```

### `webhook_logs` Tablosu
```sql
- id (UUID)
- webhook_config_id (UUID)
- event_type (VARCHAR) → "order.created", "order.updated", vb.
- event_id (UUID) → sipariş ID'si
- request_url (TEXT)
- request_body (JSONB) → gönderilen payload
- request_signature (TEXT) → HMAC imzası
- response_status (INTEGER) → 200, 404, 500, vb.
- response_body (TEXT)
- response_time_ms (INTEGER)
- status (VARCHAR) → 'success', 'failed', 'retrying'
- attempt_number (INTEGER)
- error_message (TEXT)
- delivered_at (TIMESTAMPTZ)
- next_retry_at (TIMESTAMPTZ)
```

---

## 🚀 API Endpoints

### 1. Webhook Oluşturma
```http
POST /api/webhooks
Content-Type: application/json

{
  "organization_id": "uuid",
  "name": "Salesforce CRM",
  "url": "https://api.salesforce.com/webhooks/vera-qr",
  "events": ["order.created", "order.updated", "order.completed"],
  "custom_headers": {
    "X-API-Key": "your-api-key"
  },
  "timeout_seconds": 30,
  "max_retries": 3
}
```

**Response:**
```json
{
  "webhook": {
    "id": "uuid",
    "organization_id": "uuid",
    "name": "Salesforce CRM",
    "url": "https://api.salesforce.com/webhooks/vera-qr",
    "secret_key": "64-character-hex-string",
    "is_active": true,
    "created_at": "2024-01-02T10:00:00Z"
  },
  "message": "Webhook created successfully. Save the secret_key securely, it will not be shown again."
}
```

### 2. Webhook Listesi
```http
GET /api/webhooks?organization_id=uuid
```

### 3. Webhook Güncelleme
```http
PATCH /api/webhooks/[id]
Content-Type: application/json

{
  "is_active": false,
  "regenerate_secret": true
}
```

### 4. Webhook Silme
```http
DELETE /api/webhooks/[id]
```

### 5. Webhook Test
```http
POST /api/webhooks/test
Content-Type: application/json

{
  "webhook_config_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "responseBody": "{\"ok\": true}",
  "responseTimeMs": 234,
  "message": "Webhook test successful"
}
```

### 6. Webhook Logları
```http
GET /api/webhooks/logs?organization_id=uuid&status=failed&limit=50
```

**Response:**
```json
{
  "logs": [...],
  "stats": {
    "total": 100,
    "success": 95,
    "failed": 3,
    "retrying": 2,
    "avgResponseTime": 245
  }
}
```

---

## 📤 Webhook Payload Formatı

Sipariş oluşturulduğunda gönderilen örnek payload:

```json
{
  "event": "order.created",
  "timestamp": "2024-01-02T10:30:00Z",
  "organization_id": "uuid",
  "data": {
    "id": "order-uuid",
    "order_number": "ORD-20240102-1234",
    "items": [
      {
        "menu_item_id": "uuid",
        "name": "Margherita Pizza",
        "quantity": 2,
        "price": 89.90,
        "notes": "Extra peynir"
      }
    ],
    "total_amount": 179.80,
    "status": "pending",
    "customer_name": "Ahmet Yılmaz",
    "customer_notes": "Acele etmeyin",
    "table_id": "uuid",
    "created_at": "2024-01-02T10:30:00Z"
  },
  "metadata": {
    "table_number": "12",
    "customer_name": "Ahmet Yılmaz",
    "items_count": 2
  }
}
```

### Event Türleri

1. **order.created** → Yeni sipariş oluşturuldu
2. **order.updated** → Sipariş durumu güncellendi
3. **order.completed** → Sipariş tamamlandı (status: served)
4. **order.cancelled** → Sipariş iptal edildi

---

## 🔒 Webhook İmza Doğrulama

Webhook alan sistemin yapması gerekenler:

```python
import hmac
import hashlib

def verify_webhook(payload_string, signature, secret_key):
    expected_signature = hmac.new(
        secret_key.encode('utf-8'),
        payload_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

# Kullanım
request_body = request.get_data(as_text=True)
signature = request.headers.get('X-Webhook-Signature')
secret = 'your-secret-key-from-webhook-creation'

if verify_webhook(request_body, signature, secret):
    # Webhook güvenilir, işlemi yap
    data = json.loads(request_body)
    process_order(data)
else:
    # Geçersiz imza
    return {"error": "Invalid signature"}, 401
```

**Node.js Example:**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## 🔄 Retry Mekanizması

Webhook başarısız olursa (HTTP 4xx/5xx veya timeout):

1. **1. Deneme**: Hemen (ilk gönderim)
2. **2. Deneme**: 1 dakika sonra
3. **3. Deneme**: 5 dakika sonra
4. **4. Deneme**: 30 dakika sonra

Tüm denemeler başarısız olursa, log'da `status: 'failed'` olarak işaretlenir.

### Retry Cron Job

Vercel'de otomatik çalışır (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/webhooks/retry",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Her 5 dakikada bir `/api/webhooks/retry` endpoint'i çağrılır ve başarısız webhook'lar yeniden denenır.

---

## 🎨 Popüler CRM Entegrasyonları

### Salesforce
```bash
POST https://[instance].salesforce.com/services/data/v58.0/sobjects/Order__c/
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "Name": "ORD-20240102-1234",
  "Amount__c": 179.80,
  "Status__c": "Pending",
  "Customer_Name__c": "Ahmet Yılmaz"
}
```

### HubSpot
```bash
POST https://api.hubapi.com/crm/v3/objects/deals
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "properties": {
    "dealname": "ORD-20240102-1234",
    "amount": "179.80",
    "dealstage": "appointmentscheduled"
  }
}
```

### Zoho CRM
```bash
POST https://www.zohoapis.com/crm/v3/Deals
Headers:
  Authorization: Zoho-oauthtoken {access_token}
  Content-Type: application/json

Body:
{
  "data": [{
    "Deal_Name": "ORD-20240102-1234",
    "Amount": 179.80,
    "Stage": "Qualification"
  }]
}
```

### Custom REST API (Kendi Sisteminiz)
```bash
POST https://yourdomain.com/api/orders
Headers:
  X-API-Key: your-api-key
  Content-Type: application/json

Body: (VERA-QR webhook payload'u olduğu gibi)
```

---

## 📋 Kurulum Adımları

### 1. Migration'ı Çalıştır
```sql
-- Supabase SQL Editor'da çalıştır
-- supabase/migrations/20240102000000_webhook_system.sql
```

### 2. Environment Variables
`.env.local` dosyasına ekle:
```bash
CRON_SECRET=rastgele-güvenli-token-buraya
```

### 3. Vercel'e Deploy Et
```bash
vercel --prod
```

Vercel otomatik olarak `vercel.json` içindeki cron job'u kuracak.

### 4. Webhook Oluştur
Admin panelinden veya API ile webhook config oluştur.

### 5. Test Et
```bash
curl -X POST https://veraqr.com/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"webhook_config_id": "your-webhook-id"}'
```

---

## 🧪 Test Senaryoları

### 1. Başarılı Webhook
```bash
# 1. Test webhook oluştur
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "your-org-id",
    "name": "Test Webhook",
    "url": "https://webhook.site/unique-url",
    "events": ["order.created"]
  }'

# 2. Sipariş oluştur
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{...order data...}'

# 3. Webhook.site'ta gelen veriyi kontrol et
```

### 2. Başarısız Webhook + Retry
```bash
# Geçersiz URL ile webhook oluştur
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://invalid-url-that-does-not-exist.com/webhook"
  }'

# Sipariş oluştur ve log'larda retry'leri gör
curl -X GET http://localhost:3000/api/webhooks/logs?organization_id=...
```

---

## 📊 Monitoring & Debugging

### Webhook Başarı Oranı
```sql
SELECT 
  wc.name,
  COUNT(*) as total_deliveries,
  SUM(CASE WHEN wl.status = 'success' THEN 1 ELSE 0 END) as successful,
  AVG(wl.response_time_ms) as avg_response_time
FROM webhook_logs wl
JOIN webhook_configs wc ON wl.webhook_config_id = wc.id
WHERE wl.created_at > NOW() - INTERVAL '24 hours'
GROUP BY wc.id, wc.name;
```

### Başarısız Webhook'ları Bul
```sql
SELECT * FROM webhook_logs
WHERE status = 'failed'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## ⚠️ Önemli Notlar

1. **Secret Key Güvenliği**: Webhook oluştururken dönen `secret_key`'i güvenli bir yerde sakla. Bir daha gösterilmez.

2. **HTTPS Kullan**: Production'da webhook URL'leri mutlaka HTTPS olmalı.

3. **Rate Limiting**: Aynı anda çok fazla webhook gönderimi sunucuyu yavaşlatabilir. Vercel'de varsayılan olarak işlev başına limit vardır.

4. **Timeout**: Webhook endpoint'leri 30 saniye içinde yanıt vermeli. Daha uzun işlemler için asenkron işleme yapın.

5. **Idempotency**: Aynı sipariş için birden fazla webhook gelebilir (retry). `event_id` kullanarak tekrarları filtreleyin.

---

## 🚀 Sonraki Adımlar

- [ ] Admin panel'de webhook yönetim UI'ı
- [ ] Webhook delivery grafikler (Chart.js ile)
- [ ] Webhook template library (Salesforce, HubSpot, vb. için hazır şablonlar)
- [ ] Webhook payload customization (hangi field'ların gönderileceğini seç)
- [ ] Webhook filtering (sadece belirli koşullarda gönder)

---

## 📞 Destek

Webhook entegrasyonu için yardıma ihtiyacınız varsa:
- GitHub Issues
- Email: support@veraqr.com
- Docs: https://docs.veraqr.com/webhooks
