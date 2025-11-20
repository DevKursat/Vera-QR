-- ============================================================================
-- VERA QR - Complete Database Setup Script
-- ============================================================================
-- This script can be run multiple times safely.
-- It will skip existing objects and create only missing ones.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- TABLES
-- ============================================================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    brand_color VARCHAR(7) DEFAULT '#3B82F6',
    address TEXT,
    location GEOGRAPHY(POINT),
    description TEXT,
    api_key VARCHAR(255) UNIQUE,
    working_hours JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    subscription_tier VARCHAR(50) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_translations JSONB DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_translations JSONB DEFAULT '{}',
    description TEXT,
    description_translations JSONB DEFAULT '{}',
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    allergens TEXT[],
    available BOOLEAN DEFAULT true,
    stock_count INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tables (restaurant tables)
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    table_number VARCHAR(50) NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    location_description TEXT,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'disabled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, table_number)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES tables(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
    customer_name VARCHAR(255),
    customer_notes TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    messages JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users (restaurant admins)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'restaurant_admin' CHECK (role IN ('platform_admin', 'restaurant_admin', 'staff')),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform admins
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    permissions JSONB DEFAULT '["all"]'::jsonb,
    is_super_admin BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('platform_admin', 'restaurant_admin', 'staff')),
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Organization settings
CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE NOT NULL,
    ai_personality VARCHAR(50) DEFAULT 'professional' CHECK (ai_personality IN ('friendly', 'professional', 'fun', 'formal', 'casual')),
    ai_language_preference VARCHAR(10) DEFAULT 'tr',
    ai_auto_translate BOOLEAN DEFAULT true,
    ai_voice_enabled BOOLEAN DEFAULT false,
    ai_vision_enabled BOOLEAN DEFAULT false,
    openai_api_key TEXT,
    enable_table_call BOOLEAN DEFAULT true,
    enable_loyalty_program BOOLEAN DEFAULT false,
    enable_online_payment BOOLEAN DEFAULT false,
    enable_reservations BOOLEAN DEFAULT false,
    enable_reviews BOOLEAN DEFAULT true,
    enable_stock_management BOOLEAN DEFAULT true,
    notification_email TEXT,
    notification_sms_phone TEXT,
    notification_order_created BOOLEAN DEFAULT true,
    notification_order_ready BOOLEAN DEFAULT true,
    notification_table_call BOOLEAN DEFAULT true,
    custom_css TEXT,
    welcome_message TEXT,
    footer_text TEXT,
    social_media JSONB DEFAULT '{}',
    tax_rate DECIMAL(5,2) DEFAULT 0,
    service_charge_rate DECIMAL(5,2) DEFAULT 0,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    delivery_enabled BOOLEAN DEFAULT false,
    pickup_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table calls
CREATE TABLE IF NOT EXISTS table_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES tables(id) ON DELETE CASCADE NOT NULL,
    call_type VARCHAR(50) DEFAULT 'service' CHECK (call_type IN ('service', 'bill', 'assistance', 'complaint')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'cancelled')),
    customer_note TEXT,
    resolved_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_amount DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    secret_key VARCHAR(255),
    events TEXT[] DEFAULT ARRAY['order.created', 'order.updated'],
    is_active BOOLEAN DEFAULT true,
    retry_config JSONB DEFAULT '{"max_retries": 3, "retry_delay": 60}'::jsonb,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook logs
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    attempt_count INTEGER DEFAULT 1,
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer loyalty
CREATE TABLE IF NOT EXISTS customer_loyalty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    last_visit_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, customer_phone)
);

-- Loyalty transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_loyalty(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjust')),
    points INTEGER NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_response TEXT,
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon usage
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    customer_phone VARCHAR(50),
    discount_applied DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_menu_categories_org ON menu_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_org ON menu_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_tables_org ON tables(organization_id);
CREATE INDEX IF NOT EXISTS idx_tables_qr ON tables(qr_code);
CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_org ON ai_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_org ON admin_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_admins_user_id ON platform_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_admins_email ON platform_admins(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(active);
CREATE INDEX IF NOT EXISTS idx_analytics_events_org ON analytics_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_org ON webhook_endpoints(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_endpoint ON webhook_logs(webhook_endpoint_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_org ON customer_loyalty(organization_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_phone ON customer_loyalty(customer_phone);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_org ON reviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_coupons_org ON coupons(organization_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_table_calls_org ON table_calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_table_calls_status ON table_calls(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist (to allow re-running)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Organizations viewable by everyone" ON organizations;
    DROP POLICY IF EXISTS "Authenticated users can insert organizations" ON organizations;
    DROP POLICY IF EXISTS "Users can update their own organization" ON organizations;
    DROP POLICY IF EXISTS "Menu categories viewable by everyone" ON menu_categories;
    DROP POLICY IF EXISTS "Org admins can manage menu categories" ON menu_categories;
    DROP POLICY IF EXISTS "Menu items viewable by everyone" ON menu_items;
    DROP POLICY IF EXISTS "Org admins can manage menu items" ON menu_items;
    DROP POLICY IF EXISTS "Tables viewable by everyone" ON tables;
    DROP POLICY IF EXISTS "Org admins can manage tables" ON tables;
    DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
    DROP POLICY IF EXISTS "Org admins can view their orders" ON orders;
    DROP POLICY IF EXISTS "Org admins can update their orders" ON orders;
    DROP POLICY IF EXISTS "Anyone can create AI conversations" ON ai_conversations;
    DROP POLICY IF EXISTS "Org admins can view their AI conversations" ON ai_conversations;
    DROP POLICY IF EXISTS "Users can view their own admin profile" ON admin_users;
    DROP POLICY IF EXISTS "Users can update their own admin profile" ON admin_users;
    DROP POLICY IF EXISTS "Users can insert their admin profile" ON admin_users;
    DROP POLICY IF EXISTS "Platform admins can view themselves" ON platform_admins;
    DROP POLICY IF EXISTS "Platform admins can update themselves" ON platform_admins;
    DROP POLICY IF EXISTS "Platform admins can insert themselves" ON platform_admins;
    DROP POLICY IF EXISTS "Org admins can view their settings" ON organization_settings;
    DROP POLICY IF EXISTS "Org admins can manage their settings" ON organization_settings;
    DROP POLICY IF EXISTS "Anyone can create table calls" ON table_calls;
    DROP POLICY IF EXISTS "Org admins can manage table calls" ON table_calls;
    DROP POLICY IF EXISTS "Active campaigns viewable by everyone" ON campaigns;
    DROP POLICY IF EXISTS "Org admins can manage campaigns" ON campaigns;
    DROP POLICY IF EXISTS "Org admins can view their analytics" ON analytics_events;
    DROP POLICY IF EXISTS "Anyone can insert analytics events" ON analytics_events;
    DROP POLICY IF EXISTS "Org admins can manage webhooks" ON webhook_endpoints;
    DROP POLICY IF EXISTS "Org admins can view webhook logs" ON webhook_logs;
    DROP POLICY IF EXISTS "Org admins can manage loyalty" ON customer_loyalty;
    DROP POLICY IF EXISTS "Org admins can view loyalty transactions" ON loyalty_transactions;
    DROP POLICY IF EXISTS "Org admins can create loyalty transactions" ON loyalty_transactions;
    DROP POLICY IF EXISTS "Anyone can submit reviews" ON reviews;
    DROP POLICY IF EXISTS "Approved reviews viewable by everyone" ON reviews;
    DROP POLICY IF EXISTS "Org admins can manage reviews" ON reviews;
    DROP POLICY IF EXISTS "Active coupons viewable by everyone" ON coupons;
    DROP POLICY IF EXISTS "Org admins can manage coupons" ON coupons;
    DROP POLICY IF EXISTS "Anyone can use coupons" ON coupon_usage;
    DROP POLICY IF EXISTS "Org admins can view coupon usage" ON coupon_usage;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Organizations policies
CREATE POLICY "Organizations viewable by everyone" ON organizations FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can insert organizations" ON organizations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own organization" ON organizations FOR UPDATE TO authenticated USING (id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Menu categories policies
CREATE POLICY "Menu categories viewable by everyone" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Org admins can manage menu categories" ON menu_categories FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Menu items policies
CREATE POLICY "Menu items viewable by everyone" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Org admins can manage menu items" ON menu_items FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Tables policies
CREATE POLICY "Tables viewable by everyone" ON tables FOR SELECT USING (true);
CREATE POLICY "Org admins can manage tables" ON tables FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Orders policies
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Org admins can view their orders" ON orders FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Org admins can update their orders" ON orders FOR UPDATE TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- AI conversations policies
CREATE POLICY "Anyone can create AI conversations" ON ai_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Org admins can view their AI conversations" ON ai_conversations FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Admin users policies
CREATE POLICY "Users can view their own admin profile" ON admin_users FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update their own admin profile" ON admin_users FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their admin profile" ON admin_users FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Platform admins policies
CREATE POLICY "Platform admins can view themselves" ON platform_admins FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Platform admins can update themselves" ON platform_admins FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Platform admins can insert themselves" ON platform_admins FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Organization settings policies
CREATE POLICY "Org admins can view their settings" ON organization_settings FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Org admins can manage their settings" ON organization_settings FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Table calls policies
CREATE POLICY "Anyone can create table calls" ON table_calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Org admins can manage table calls" ON table_calls FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Campaigns policies
CREATE POLICY "Active campaigns viewable by everyone" ON campaigns FOR SELECT USING (active = true);
CREATE POLICY "Org admins can manage campaigns" ON campaigns FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Analytics events policies
CREATE POLICY "Org admins can view their analytics" ON analytics_events FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can insert analytics events" ON analytics_events FOR INSERT WITH CHECK (true);

-- Webhook policies
CREATE POLICY "Org admins can manage webhooks" ON webhook_endpoints FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Org admins can view webhook logs" ON webhook_logs FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Customer loyalty policies
CREATE POLICY "Org admins can manage loyalty" ON customer_loyalty FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Org admins can view loyalty transactions" ON loyalty_transactions FOR SELECT TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Org admins can create loyalty transactions" ON loyalty_transactions FOR INSERT TO authenticated WITH CHECK (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Reviews policies
CREATE POLICY "Anyone can submit reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Approved reviews viewable by everyone" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Org admins can manage reviews" ON reviews FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));

-- Coupons policies
CREATE POLICY "Active coupons viewable by everyone" ON coupons FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));
CREATE POLICY "Org admins can manage coupons" ON coupons FOR ALL TO authenticated USING (organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can use coupons" ON coupon_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Org admins can view coupon usage" ON coupon_usage FOR SELECT TO authenticated USING (coupon_id IN (SELECT id FROM coupons WHERE organization_id IN (SELECT organization_id FROM admin_users WHERE user_id = auth.uid())));

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
    DROP TRIGGER IF EXISTS update_menu_categories_updated_at ON menu_categories;
    DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
    DROP TRIGGER IF EXISTS update_tables_updated_at ON tables;
    DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
    DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
    DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
    DROP TRIGGER IF EXISTS update_platform_admins_updated_at ON platform_admins;
    DROP TRIGGER IF EXISTS update_organization_settings_updated_at ON organization_settings;
    DROP TRIGGER IF EXISTS update_table_calls_updated_at ON table_calls;
    DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
    DROP TRIGGER IF EXISTS update_customer_loyalty_updated_at ON customer_loyalty;
    DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
    DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Create triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_admins_updated_at BEFORE UPDATE ON platform_admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_settings_updated_at BEFORE UPDATE ON organization_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_table_calls_updated_at BEFORE UPDATE ON table_calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_loyalty_updated_at BEFORE UPDATE ON customer_loyalty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate QR code string
CREATE OR REPLACE FUNCTION generate_qr_code(org_slug TEXT, table_num TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN org_slug || '-' || table_num || '-' || substr(md5(random()::text), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE organizations IS 'Restaurant organizations in the platform';
COMMENT ON TABLE menu_categories IS 'Menu categories for organizing items';
COMMENT ON TABLE menu_items IS 'Individual menu items with pricing and details';
COMMENT ON TABLE tables IS 'Physical tables with QR codes';
COMMENT ON TABLE orders IS 'Customer orders placed through the system';
COMMENT ON TABLE ai_conversations IS 'AI assistant conversation history';
COMMENT ON TABLE admin_users IS 'Restaurant admin users with role-based access';
COMMENT ON TABLE platform_admins IS 'Platform administrators who manage the entire system';
COMMENT ON TABLE campaigns IS 'Marketing campaigns and promotions';
COMMENT ON TABLE analytics_events IS 'Analytics and tracking events';
COMMENT ON TABLE webhook_endpoints IS 'Webhook endpoints for organization integrations';
COMMENT ON TABLE webhook_logs IS 'Logs of webhook deliveries and responses';
COMMENT ON TABLE customer_loyalty IS 'Customer loyalty program data';
COMMENT ON TABLE loyalty_transactions IS 'Individual loyalty point transactions';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings';
COMMENT ON TABLE coupons IS 'Discount coupons and promotional codes';
COMMENT ON TABLE coupon_usage IS 'Tracking of coupon redemptions';
COMMENT ON TABLE table_calls IS 'Customer table call requests (waiter calls)';
COMMENT ON TABLE organization_settings IS 'Organization-specific settings and preferences';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ VERA QR database setup completed successfully!';
    RAISE NOTICE 'All tables, indexes, policies, and functions are now in place.';
    RAISE NOTICE 'You can now start using the platform.';
END $$;
