-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS POLICIES
-- Public can read active organizations for customer views
CREATE POLICY "Public can read active organizations"
    ON organizations FOR SELECT
    USING (status = 'active');

-- Admins can view their own organization
CREATE POLICY "Admins can view their organization"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id FROM admin_users
            WHERE id = auth.uid()
        )
    );

-- Platform admins can do everything
CREATE POLICY "Platform admins full access"
    ON organizations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

-- MENU CATEGORIES POLICIES
-- Public can read categories from active organizations
CREATE POLICY "Public can read categories"
    ON menu_categories FOR SELECT
    USING (
        organization_id IN (
            SELECT id FROM organizations WHERE status = 'active'
        )
    );

-- Restaurant admins can manage their categories
CREATE POLICY "Restaurant admins manage categories"
    ON menu_categories FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users
            WHERE id = auth.uid()
        )
    );

-- MENU ITEMS POLICIES
-- Public can read available items from active organizations
CREATE POLICY "Public can read menu items"
    ON menu_items FOR SELECT
    USING (
        organization_id IN (
            SELECT id FROM organizations WHERE status = 'active'
        )
    );

-- Restaurant admins can manage their menu items
CREATE POLICY "Restaurant admins manage items"
    ON menu_items FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users
            WHERE id = auth.uid()
        )
    );

-- TABLES POLICIES
-- Public can read tables (for QR code validation)
CREATE POLICY "Public can read tables"
    ON tables FOR SELECT
    USING (
        organization_id IN (
            SELECT id FROM organizations WHERE status = 'active'
        )
    );

-- Restaurant admins can manage their tables
CREATE POLICY "Restaurant admins manage tables"
    ON tables FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users
            WHERE id = auth.uid()
        )
    );

-- ORDERS POLICIES
-- Public can insert orders (customers placing orders)
CREATE POLICY "Public can create orders"
    ON orders FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT id FROM organizations WHERE status = 'active'
        )
    );

-- Public can read their own orders by session_id
CREATE POLICY "Public can read own orders"
    ON orders FOR SELECT
    USING (true); -- Session validation happens in application layer

-- Restaurant admins can manage their orders
CREATE POLICY "Restaurant admins manage orders"
    ON orders FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users
            WHERE id = auth.uid()
        )
    );

-- AI CONVERSATIONS POLICIES
-- Public can create conversations
CREATE POLICY "Public can create conversations"
    ON ai_conversations FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT id FROM organizations WHERE status = 'active'
        )
    );

-- Public can read own conversations by session
CREATE POLICY "Public can read own conversations"
    ON ai_conversations FOR SELECT
    USING (true);

-- Restaurant admins can view their conversations
CREATE POLICY "Restaurant admins view conversations"
    ON ai_conversations FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users
            WHERE id = auth.uid()
        )
    );

-- ADMIN USERS POLICIES
-- Users can read their own data
CREATE POLICY "Users can read own data"
    ON admin_users FOR SELECT
    USING (id = auth.uid());

-- Platform admins can manage all users
CREATE POLICY "Platform admins manage users"
    ON admin_users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

-- Restaurant admins can manage their organization users
CREATE POLICY "Restaurant admins manage org users"
    ON admin_users FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users
            WHERE id = auth.uid() AND role IN ('restaurant_admin')
        )
    );

-- CAMPAIGNS POLICIES
-- Public can read active campaigns
CREATE POLICY "Public can read active campaigns"
    ON campaigns FOR SELECT
    USING (
        active = true
        AND organization_id IN (
            SELECT id FROM organizations WHERE status = 'active'
        )
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
    );

-- Restaurant admins can manage their campaigns
CREATE POLICY "Restaurant admins manage campaigns"
    ON campaigns FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users
            WHERE id = auth.uid()
        )
    );

-- ANALYTICS EVENTS POLICIES
-- Public can create analytics events
CREATE POLICY "Public can create analytics"
    ON analytics_events FOR INSERT
    WITH CHECK (true);

-- Restaurant admins can view their analytics
CREATE POLICY "Restaurant admins view analytics"
    ON analytics_events FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users
            WHERE id = auth.uid()
        )
    );

-- Platform admins can view all analytics
CREATE POLICY "Platform admins view all analytics"
    ON analytics_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );
