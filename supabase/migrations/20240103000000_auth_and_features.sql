-- Authentication and Authorization Enhancement
-- This migration adds Supabase Auth integration and role-based access control

-- Update admin_users table to link with Supabase Auth
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add unique constraint for auth_user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON admin_users(auth_user_id);

-- Platform Administrators Table (Super Admins)
CREATE TABLE IF NOT EXISTS platform_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  permissions JSONB DEFAULT '["all"]'::jsonb, -- ["manage_organizations", "manage_users", "view_analytics", etc.]
  is_super_admin BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Sessions Table (for tracking and analytics)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('platform_admin', 'restaurant_admin', 'staff')),
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Organization Settings Table (extended configuration)
CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- AI Assistant Settings
  ai_personality VARCHAR(50) DEFAULT 'professional' CHECK (ai_personality IN ('friendly', 'professional', 'fun', 'formal', 'casual')),
  ai_language_preference VARCHAR(10) DEFAULT 'tr',
  ai_auto_translate BOOLEAN DEFAULT true,
  ai_voice_enabled BOOLEAN DEFAULT false,
  ai_vision_enabled BOOLEAN DEFAULT false,
  
  -- Feature Toggles
  enable_table_call BOOLEAN DEFAULT true,
  enable_loyalty_program BOOLEAN DEFAULT false,
  enable_online_payment BOOLEAN DEFAULT false,
  enable_reservations BOOLEAN DEFAULT false,
  enable_reviews BOOLEAN DEFAULT true,
  enable_stock_management BOOLEAN DEFAULT true,
  
  -- Notification Settings
  notification_email TEXT,
  notification_sms_phone TEXT,
  notification_order_created BOOLEAN DEFAULT true,
  notification_order_ready BOOLEAN DEFAULT true,
  notification_table_call BOOLEAN DEFAULT true,
  
  -- Branding
  custom_css TEXT,
  welcome_message TEXT,
  footer_text TEXT,
  social_media JSONB DEFAULT '{}', -- {"instagram": "@username", "facebook": "page", etc.}
  
  -- Business Settings
  tax_rate DECIMAL(5,2) DEFAULT 0,
  service_charge_rate DECIMAL(5,2) DEFAULT 0,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  delivery_enabled BOOLEAN DEFAULT false,
  pickup_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Calls / Service Requests
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

-- Loyalty Program
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  customer_phone VARCHAR(50) NOT NULL, -- Customer identifier
  customer_name VARCHAR(255),
  points_balance INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  total_points_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, customer_phone)
);

-- Loyalty Transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loyalty_account_id UUID REFERENCES loyalty_points(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'expired', 'adjusted')),
  points_amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons / Discount Codes
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_item')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  applicable_items UUID[], -- Array of menu_item ids (null = all items)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews / Ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_name VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  ambiance_rating INTEGER CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5),
  is_published BOOLEAN DEFAULT false,
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_admin_users_org ON admin_users(organization_id);
CREATE INDEX idx_admin_users_auth ON admin_users(auth_user_id);
CREATE INDEX idx_platform_admins_auth ON platform_admins(auth_user_id);
CREATE INDEX idx_user_sessions_auth ON user_sessions(auth_user_id);
CREATE INDEX idx_user_sessions_org ON user_sessions(organization_id);
CREATE INDEX idx_org_settings_org ON organization_settings(organization_id);
CREATE INDEX idx_table_calls_org ON table_calls(organization_id);
CREATE INDEX idx_table_calls_status ON table_calls(status, created_at);
CREATE INDEX idx_loyalty_points_org ON loyalty_points(organization_id);
CREATE INDEX idx_loyalty_points_phone ON loyalty_points(customer_phone);
CREATE INDEX idx_coupons_org ON coupons(organization_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_reviews_org ON reviews(organization_id);
CREATE INDEX idx_reviews_published ON reviews(is_published, created_at);

-- Updated timestamp triggers
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_admins_updated_at
  BEFORE UPDATE ON platform_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_table_calls_updated_at
  BEFORE UPDATE ON table_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at
  BEFORE UPDATE ON loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE platform_admins IS 'Super administrators who manage the entire platform';
COMMENT ON TABLE user_sessions IS 'Track user login sessions for analytics and security';
COMMENT ON TABLE organization_settings IS 'Extended settings for each restaurant including AI, features, and branding';
COMMENT ON TABLE table_calls IS 'Service requests from customers (waiter calls, assistance)';
COMMENT ON TABLE loyalty_points IS 'Customer loyalty points balance per restaurant';
COMMENT ON TABLE loyalty_transactions IS 'History of loyalty points earned and spent';
COMMENT ON TABLE coupons IS 'Discount codes and promotional campaigns';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for restaurants';
