-- Row Level Security Policies for New Tables

-- =============================================
-- PLATFORM ADMINS
-- =============================================
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Platform admins can view other platform admins
CREATE POLICY "Platform admins can view platform admins"
  ON platform_admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );

-- Only super admins can insert/update/delete platform admins
CREATE POLICY "Super admins can manage platform admins"
  ON platform_admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
      AND pa.is_super_admin = true
    )
  );

-- =============================================
-- ADMIN USERS (Restaurant Admins)
-- =============================================
-- Update existing policies to use auth_user_id

-- Restaurant admins can view users in their organization
DROP POLICY IF EXISTS "Restaurant admins can view users" ON admin_users;
CREATE POLICY "Restaurant admins can view their org users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.auth_user_id = auth.uid()
      AND au.organization_id = admin_users.organization_id
      AND au.role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );

-- =============================================
-- USER SESSIONS
-- =============================================
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  USING (auth_user_id = auth.uid());

-- Platform admins can view all sessions
CREATE POLICY "Platform admins can view all sessions"
  ON user_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );

-- System can insert sessions
CREATE POLICY "System can insert sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- ORGANIZATION SETTINGS
-- =============================================
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- Restaurant admins can view their settings
CREATE POLICY "Restaurant admins can view settings"
  ON organization_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.auth_user_id = auth.uid()
      AND au.organization_id = organization_settings.organization_id
    )
    OR
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );

-- Restaurant admins can update their settings
CREATE POLICY "Restaurant admins can update settings"
  ON organization_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.auth_user_id = auth.uid()
      AND au.organization_id = organization_settings.organization_id
      AND au.role IN ('owner', 'admin')
    )
  );

-- =============================================
-- TABLE CALLS
-- =============================================
ALTER TABLE table_calls ENABLE ROW LEVEL SECURITY;

-- Anyone can create table calls (customers)
CREATE POLICY "Anyone can create table calls"
  ON table_calls FOR INSERT
  WITH CHECK (true);

-- Restaurant staff can view their table calls
CREATE POLICY "Restaurant staff can view table calls"
  ON table_calls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.auth_user_id = auth.uid()
      AND au.organization_id = table_calls.organization_id
    )
    OR
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );

-- Restaurant staff can update table calls
CREATE POLICY "Restaurant staff can update table calls"
  ON table_calls FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.auth_user_id = auth.uid()
      AND au.organization_id = table_calls.organization_id
    )
  );

-- =============================================
-- LOYALTY POINTS
-- =============================================
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Restaurant staff can manage loyalty points
CREATE POLICY "Restaurant staff can manage loyalty points"
  ON loyalty_points FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.auth_user_id = auth.uid()
      AND au.organization_id = loyalty_points.organization_id
    )
    OR
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );

-- =============================================
-- LOYALTY TRANSACTIONS
-- =============================================
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Restaurant staff can view loyalty transactions
CREATE POLICY "Restaurant staff can view loyalty transactions"
  ON loyalty_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loyalty_points lp
      JOIN admin_users au ON au.organization_id = lp.organization_id
      WHERE lp.id = loyalty_transactions.loyalty_account_id
      AND au.auth_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );

-- System can insert loyalty transactions
CREATE POLICY "System can insert loyalty transactions"
  ON loyalty_transactions FOR INSERT
  WITH CHECK (true);

-- =============================================
-- COUPONS
-- =============================================
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Restaurant admins can manage coupons
CREATE POLICY "Restaurant admins can manage coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.auth_user_id = auth.uid()
      AND au.organization_id = coupons.organization_id
      AND au.role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );

-- Anyone can view active coupons (for validation)
CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true);

-- =============================================
-- REVIEWS
-- =============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can create reviews
CREATE POLICY "Anyone can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Everyone can view published reviews
CREATE POLICY "Everyone can view published reviews"
  ON reviews FOR SELECT
  USING (is_published = true);

-- Restaurant admins can view all reviews (including unpublished)
CREATE POLICY "Restaurant admins can view all reviews"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.auth_user_id = auth.uid()
      AND au.organization_id = reviews.organization_id
    )
    OR
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );

-- Restaurant admins can update reviews (for responding)
CREATE POLICY "Restaurant admins can update reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.auth_user_id = auth.uid()
      AND au.organization_id = reviews.organization_id
      AND au.role IN ('owner', 'admin')
    )
  );

-- Update existing policies for organizations
DROP POLICY IF EXISTS "Platform admins can manage organizations" ON organizations;
CREATE POLICY "Platform admins can manage organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );

-- Restaurant admins can view their own organization
DROP POLICY IF EXISTS "Restaurant admins can view organization" ON organizations;
CREATE POLICY "Restaurant admins can view their organization"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.auth_user_id = auth.uid()
      AND au.organization_id = organizations.id
    )
    OR
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.auth_user_id = auth.uid()
    )
  );
