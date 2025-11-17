-- Seed data for development/testing

-- Create platform admin user
INSERT INTO admin_users (id, email, password_hash, full_name, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@veraqr.com',
    '$2a$10$placeholder', -- Replace with actual bcrypt hash
    'Platform Administrator',
    'platform_admin'
);

-- Create test restaurant organizations
INSERT INTO organizations (id, name, slug, description, brand_color, address, status, subscription_tier)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Bella Italia Ristorante',
        'bella-italia',
        'Authentic Italian cuisine in the heart of the city',
        '#C41E3A',
        'Via Roma 123, Istanbul',
        'active',
        'pro'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'Sushi Master',
        'sushi-master',
        'Traditional Japanese sushi bar',
        '#E60012',
        'Sakura Street 45, Istanbul',
        'active',
        'starter'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Burger House',
        'burger-house',
        'Gourmet burgers and craft beers',
        '#FDB913',
        'American Avenue 78, Istanbul',
        'active',
        'pro'
    );

-- Create restaurant admin users
INSERT INTO admin_users (email, password_hash, full_name, role, organization_id)
VALUES
    (
        'admin@bella-italia.com',
        '$2a$10$placeholder',
        'Marco Rossi',
        'restaurant_admin',
        '10000000-0000-0000-0000-000000000001'
    ),
    (
        'admin@sushi-master.com',
        '$2a$10$placeholder',
        'Takeshi Yamamoto',
        'restaurant_admin',
        '10000000-0000-0000-0000-000000000002'
    ),
    (
        'admin@burger-house.com',
        '$2a$10$placeholder',
        'John Smith',
        'restaurant_admin',
        '10000000-0000-0000-0000-000000000003'
    );

-- Create menu categories for Bella Italia
INSERT INTO menu_categories (organization_id, name, display_order)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'Antipasti', 1),
    ('10000000-0000-0000-0000-000000000001', 'Pasta', 2),
    ('10000000-0000-0000-0000-000000000001', 'Pizza', 3),
    ('10000000-0000-0000-0000-000000000001', 'Desserts', 4),
    ('10000000-0000-0000-0000-000000000001', 'Beverages', 5);

-- Create menu items for Bella Italia
INSERT INTO menu_items (organization_id, category_id, name, description, price, allergens, available)
SELECT
    '10000000-0000-0000-0000-000000000001',
    c.id,
    item.name,
    item.description,
    item.price,
    item.allergens,
    true
FROM menu_categories c
CROSS JOIN LATERAL (
    VALUES
        ('Bruschetta al Pomodoro', 'Toasted bread with fresh tomatoes, garlic, and basil', 45.00, ARRAY['gluten'], 1),
        ('Caprese Salad', 'Fresh mozzarella, tomatoes, and basil with olive oil', 55.00, ARRAY['dairy'], 1),
        ('Spaghetti Carbonara', 'Classic Roman pasta with eggs, cheese, and guanciale', 85.00, ARRAY['gluten', 'dairy', 'eggs'], 2),
        ('Penne Arrabbiata', 'Spicy tomato sauce with garlic and red peppers', 75.00, ARRAY['gluten'], 2),
        ('Margherita Pizza', 'Tomato sauce, mozzarella, and fresh basil', 95.00, ARRAY['gluten', 'dairy'], 3),
        ('Quattro Formaggi', 'Four cheese pizza', 110.00, ARRAY['gluten', 'dairy'], 3),
        ('Tiramisu', 'Classic Italian coffee-flavored dessert', 65.00, ARRAY['gluten', 'dairy', 'eggs'], 4),
        ('Panna Cotta', 'Creamy vanilla pudding with berry sauce', 55.00, ARRAY['dairy'], 4),
        ('Espresso', 'Italian coffee', 25.00, ARRAY[]::text[], 5),
        ('Limoncello', 'Traditional lemon liqueur', 35.00, ARRAY[]::text[], 5)
) AS item(name, description, price, allergens, category_order)
WHERE c.organization_id = '10000000-0000-0000-0000-000000000001'
    AND c.display_order = item.category_order;

-- Create tables for Bella Italia
INSERT INTO tables (organization_id, table_number, qr_code, location_description)
SELECT
    '10000000-0000-0000-0000-000000000001',
    'T' || series,
    'bella-italia-t' || series || '-' || substr(md5(random()::text), 1, 8),
    CASE
        WHEN series <= 5 THEN 'Main dining area'
        WHEN series <= 8 THEN 'Terrace'
        ELSE 'Private room'
    END
FROM generate_series(1, 10) series;

-- Create similar data for Sushi Master
INSERT INTO menu_categories (organization_id, name, display_order)
VALUES
    ('10000000-0000-0000-0000-000000000002', 'Nigiri', 1),
    ('10000000-0000-0000-0000-000000000002', 'Maki Rolls', 2),
    ('10000000-0000-0000-0000-000000000002', 'Sashimi', 3),
    ('10000000-0000-0000-0000-000000000002', 'Special Rolls', 4),
    ('10000000-0000-0000-0000-000000000002', 'Drinks', 5);

INSERT INTO menu_items (organization_id, category_id, name, description, price, allergens, available)
SELECT
    '10000000-0000-0000-0000-000000000002',
    c.id,
    item.name,
    item.description,
    item.price,
    item.allergens,
    true
FROM menu_categories c
CROSS JOIN LATERAL (
    VALUES
        ('Salmon Nigiri', 'Fresh salmon on rice', 45.00, ARRAY['fish'], 1),
        ('Tuna Nigiri', 'Fresh tuna on rice', 50.00, ARRAY['fish'], 1),
        ('California Roll', 'Crab, avocado, cucumber', 65.00, ARRAY['shellfish'], 2),
        ('Spicy Tuna Roll', 'Spicy tuna with cucumber', 70.00, ARRAY['fish'], 2),
        ('Salmon Sashimi', '6 pieces of fresh salmon', 85.00, ARRAY['fish'], 3),
        ('Mixed Sashimi', 'Chef\'s selection of fresh fish', 120.00, ARRAY['fish'], 3),
        ('Dragon Roll', 'Eel, cucumber, avocado', 95.00, ARRAY['fish'], 4),
        ('Rainbow Roll', 'California roll topped with mixed fish', 110.00, ARRAY['fish', 'shellfish'], 4),
        ('Sake', 'Traditional Japanese rice wine', 45.00, ARRAY[]::text[], 5),
        ('Green Tea', 'Hot Japanese green tea', 20.00, ARRAY[]::text[], 5)
) AS item(name, description, price, allergens, category_order)
WHERE c.organization_id = '10000000-0000-0000-0000-000000000002'
    AND c.display_order = item.category_order;

INSERT INTO tables (organization_id, table_number, qr_code, location_description)
SELECT
    '10000000-0000-0000-0000-000000000002',
    'T' || series,
    'sushi-master-t' || series || '-' || substr(md5(random()::text), 1, 8),
    CASE
        WHEN series <= 4 THEN 'Sushi bar'
        ELSE 'Dining area'
    END
FROM generate_series(1, 8) series;

-- Create campaign for Bella Italia
INSERT INTO campaigns (organization_id, title, description, discount_percentage, active, start_date, end_date)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    'Lunch Special',
    'Get 20% off on all pasta dishes during lunch hours (12:00-15:00)',
    20,
    true,
    NOW(),
    NOW() + INTERVAL '30 days'
);

COMMENT ON TABLE organizations IS 'Restaurant organizations in the platform';
COMMENT ON TABLE menu_categories IS 'Menu categories for organizing items';
COMMENT ON TABLE menu_items IS 'Individual menu items with pricing and details';
COMMENT ON TABLE tables IS 'Physical tables with QR codes';
COMMENT ON TABLE orders IS 'Customer orders placed through the system';
COMMENT ON TABLE ai_conversations IS 'AI assistant conversation history';
COMMENT ON TABLE admin_users IS 'Admin users with role-based access';
COMMENT ON TABLE campaigns IS 'Marketing campaigns and promotions';
COMMENT ON TABLE analytics_events IS 'Analytics and tracking events';
