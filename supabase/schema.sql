-- ============================================================================
-- VERA QR - Supabase Veritabanı Şeması
-- ============================================================================
-- Bu script temiz bir başlangıç için tüm tabloları DROP eder ve yeniden oluşturur
-- UYARI: Bu script mevcut verileri siler!
-- ============================================================================

-- Gerekli uzantıları etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- TABLOLARI KALDIR (Eski veriler silinecek)
-- ============================================================================

DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS table_calls CASCADE;
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS webhook_endpoints CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS restaurant_admins CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS ai_configs CASCADE;

-- Eski tablolar (yeni yapıya göre kaldırılacak)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS menu_categories CASCADE;
DROP TABLE IF EXISTS organization_settings CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS platform_admins CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ============================================================================
-- YENİ TABLOLAR
-- ============================================================================

-- Kullanıcı profilleri (auth.users ile bağlantılı)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('platform_admin', 'restaurant_admin', 'staff')),
    phone VARCHAR(50),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restoranlar (Tenant yapısı)
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    address TEXT,
    wifi_ssid VARCHAR(255),
    wifi_password VARCHAR(255),
    api_key VARCHAR(255) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    description TEXT,
    working_hours JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    subscription_tier VARCHAR(50) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restoran adminleri (Join table - profiles ve restaurants arasında)
CREATE TABLE restaurant_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '["all"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, restaurant_id)
);

-- Menü kategorileri
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_translations JSONB DEFAULT '{}'::jsonb,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ürünler (Menü öğeleri)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    name_translations JSONB DEFAULT '{}'::jsonb,
    description TEXT,
    description_translations JSONB DEFAULT '{}'::jsonb,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- AI asistan için etiketler
    is_available BOOLEAN DEFAULT true,
    stock_count INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Konfigürasyonu (Her restoran için)
CREATE TABLE ai_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    personality VARCHAR(50) DEFAULT 'professional' CHECK (personality IN ('friendly', 'professional', 'fun', 'formal', 'casual')),
    custom_prompt TEXT,
    language VARCHAR(10) DEFAULT 'tr',
    auto_translate BOOLEAN DEFAULT true,
    voice_enabled BOOLEAN DEFAULT false,
    model VARCHAR(50) DEFAULT 'gpt-4',
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 500,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Konuşmaları
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kampanyalar
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_amount DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    conditions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analitik olayları
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Masa çağrıları
CREATE TABLE table_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    call_type VARCHAR(50) DEFAULT 'service' CHECK (call_type IN ('service', 'bill', 'assistance', 'complaint')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'cancelled')),
    customer_note TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- İNDEKSLER (Performans için)
-- ============================================================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurant_admins_profile ON restaurant_admins(profile_id);
CREATE INDEX idx_restaurant_admins_restaurant ON restaurant_admins(restaurant_id);
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_ai_conversations_restaurant ON ai_conversations(restaurant_id);
CREATE INDEX idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX idx_analytics_restaurant ON analytics_events(restaurant_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_table_calls_restaurant ON table_calls(restaurant_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ============================================================================

-- RLS'i etkinleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_calls ENABLE ROW LEVEL SECURITY;

-- Profiles politikaları
CREATE POLICY "Kullanıcılar kendi profillerini görebilir"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Platform adminler tüm profilleri görebilir"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

CREATE POLICY "Platform adminler profil oluşturabilir"
    ON profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

-- Restaurants politikaları
CREATE POLICY "Platform adminler tüm restoranları görebilir"
    ON restaurants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

CREATE POLICY "Restaurant adminler kendi restoranlarını görebilir"
    ON restaurants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_admins ra
            WHERE ra.restaurant_id = id AND ra.profile_id = auth.uid()
        )
    );

CREATE POLICY "Restaurant adminler kendi restoranlarını güncelleyebilir"
    ON restaurants FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_admins ra
            WHERE ra.restaurant_id = id AND ra.profile_id = auth.uid()
        )
    );

CREATE POLICY "Herkes restoranları görebilir (public menu için)"
    ON restaurants FOR SELECT
    USING (status = 'active');

-- Categories politikaları
CREATE POLICY "Platform adminler tüm kategorileri yönetebilir"
    ON categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

CREATE POLICY "Restaurant adminler kendi kategorilerini yönetebilir"
    ON categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_admins ra
            WHERE ra.restaurant_id = restaurant_id AND ra.profile_id = auth.uid()
        )
    );

CREATE POLICY "Herkes aktif kategorileri görebilir"
    ON categories FOR SELECT
    USING (visible = true);

-- Products politikaları
CREATE POLICY "Platform adminler tüm ürünleri yönetebilir"
    ON products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

CREATE POLICY "Restaurant adminler kendi ürünlerini yönetebilir"
    ON products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_admins ra
            WHERE ra.restaurant_id = restaurant_id AND ra.profile_id = auth.uid()
        )
    );

CREATE POLICY "Herkes aktif ürünleri görebilir"
    ON products FOR SELECT
    USING (is_available = true);

-- AI Configs politikaları
CREATE POLICY "Platform adminler tüm AI configleri yönetebilir"
    ON ai_configs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

CREATE POLICY "Restaurant adminler kendi AI configlerini yönetebilir"
    ON ai_configs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_admins ra
            WHERE ra.restaurant_id = restaurant_id AND ra.profile_id = auth.uid()
        )
    );

-- AI Conversations politikaları
CREATE POLICY "Restaurant adminler kendi konuşmalarını görebilir"
    ON ai_conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_admins ra
            WHERE ra.restaurant_id = restaurant_id AND ra.profile_id = auth.uid()
        )
    );

-- Campaigns politikaları
CREATE POLICY "Platform adminler tüm kampanyaları yönetebilir"
    ON campaigns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

CREATE POLICY "Restaurant adminler kendi kampanyalarını yönetebilir"
    ON campaigns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_admins ra
            WHERE ra.restaurant_id = restaurant_id AND ra.profile_id = auth.uid()
        )
    );

-- Analytics politikaları
CREATE POLICY "Restaurant adminler kendi analitiğini görebilir"
    ON analytics_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_admins ra
            WHERE ra.restaurant_id = restaurant_id AND ra.profile_id = auth.uid()
        )
    );

-- Table Calls politikaları
CREATE POLICY "Restaurant adminler kendi masa çağrılarını yönetebilir"
    ON table_calls FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM restaurant_admins ra
            WHERE ra.restaurant_id = restaurant_id AND ra.profile_id = auth.uid()
        )
    );

-- ============================================================================
-- TRIGGER'LAR
-- ============================================================================

-- updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_configs_updated_at BEFORE UPDATE ON ai_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_table_calls_updated_at BEFORE UPDATE ON table_calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED VERİLERİ
-- ============================================================================

-- NOT: Bu kullanıcıları oluşturmadan önce Supabase Auth'da manuel olarak oluşturmalısınız!
-- Aşağıdaki ID'ler örnek olarak verilmiştir. Gerçek kullanıcı ID'lerini kullanın.

-- Platform Admin (admin@veraqr.com)
-- Önce Supabase Dashboard > Authentication > Users'dan bu kullanıcıyı oluşturun
-- Email: admin@veraqr.com
-- Password: admin1
-- Kullanıcı oluşturulduktan sonra ID'sini alın ve aşağıdaki INSERT'e yerleştirin

-- Örnek Platform Admin profili
-- UYARI: Bu UUID'yi gerçek auth.users ID'si ile değiştirin!
INSERT INTO profiles (id, email, full_name, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001', -- Bu ID'yi gerçek auth.users.id ile değiştirin
    'admin@veraqr.com',
    'Platform Yöneticisi',
    'platform_admin',
    true
)
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

-- Test restoranı oluştur
INSERT INTO restaurants (id, name, slug, description, primary_color, address, status, subscription_tier)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    'Bella Italia Ristorante',
    'bella-italia',
    'Şehrin kalbinde otantik İtalyan mutfağı',
    '#C41E3A',
    'Via Roma 123, İstanbul',
    'active',
    'pro'
)
ON CONFLICT (id) DO NOTHING;

-- Test kategorileri
INSERT INTO categories (restaurant_id, name, display_order)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'Kahve', 1),
    ('10000000-0000-0000-0000-000000000001', 'Tatlılar', 2),
    ('10000000-0000-0000-0000-000000000001', 'Ana Yemekler', 3),
    ('10000000-0000-0000-0000-000000000001', 'İçecekler', 4)
ON CONFLICT DO NOTHING;

-- Test ürünleri
INSERT INTO products (restaurant_id, category_id, name, description, price, ai_tags, is_available)
SELECT
    '10000000-0000-0000-0000-000000000001',
    c.id,
    item.name,
    item.description,
    item.price,
    item.ai_tags,
    true
FROM categories c
CROSS JOIN LATERAL (
    VALUES
        ('Espresso', 'İtalyan tarzı espresso', 25.00, ARRAY['kahve', 'espresso', 'sıcak'], 1),
        ('Cappuccino', 'Espresso, süt köpüğü ve tarçın', 35.00, ARRAY['kahve', 'süt', 'sıcak', 'cappuccino'], 1),
        ('Tiramisu', 'Klasik İtalyan kahve aromalı tatlı', 65.00, ARRAY['tatlı', 'kahve', 'mascarpone'], 2),
        ('Panna Cotta', 'Kremalı vanilya tatlısı', 55.00, ARRAY['tatlı', 'krema', 'vanilya'], 2),
        ('Margherita Pizza', 'Domates sosu, mozzarella ve fesleğen', 95.00, ARRAY['pizza', 'mozzarella', 'domates', 'ana yemek'], 3),
        ('Spaghetti Carbonara', 'Yumurta, peynir ve guanciale ile klasik Roma makarnası', 85.00, ARRAY['makarna', 'yumurta', 'peynir', 'ana yemek'], 3),
        ('Limonata', 'Taze sıkılmış limon suyu', 30.00, ARRAY['içecek', 'limon', 'serinletici', 'soğuk'], 4),
        ('Su', 'Şişe su', 10.00, ARRAY['su', 'içecek'], 4)
) AS item(name, description, price, ai_tags, category_order)
WHERE c.restaurant_id = '10000000-0000-0000-0000-000000000001'
    AND c.display_order = item.category_order
ON CONFLICT DO NOTHING;

-- AI Config
INSERT INTO ai_configs (restaurant_id, personality, custom_prompt, language)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    'professional',
    'Sen Bella Italia Ristorante''nin AI asistanısın. Müşterilere yardımcı ol, menü hakkında bilgi ver ve sipariş almalarına yardım et.',
    'tr'
)
ON CONFLICT (restaurant_id) DO NOTHING;

-- ============================================================================
-- YORUMLAR
-- ============================================================================

COMMENT ON TABLE profiles IS 'Kullanıcı profilleri - auth.users ile bağlantılı';
COMMENT ON TABLE restaurants IS 'Restoranlar - Platform''daki tenant''lar';
COMMENT ON TABLE restaurant_admins IS 'Restoran yöneticileri - profiles ve restaurants arasında ilişki';
COMMENT ON TABLE categories IS 'Menü kategorileri';
COMMENT ON TABLE products IS 'Menü ürünleri';
COMMENT ON TABLE ai_configs IS 'AI asistan konfigürasyonları';
COMMENT ON TABLE ai_conversations IS 'AI asistan konuşma geçmişi';
COMMENT ON TABLE campaigns IS 'Kampanyalar ve promosyonlar';
COMMENT ON TABLE analytics_events IS 'Analitik ve takip olayları';
COMMENT ON TABLE table_calls IS 'Masa çağrı sistemi';
