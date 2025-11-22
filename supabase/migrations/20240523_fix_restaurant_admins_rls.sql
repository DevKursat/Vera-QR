-- Enable RLS on restaurant_admins table
ALTER TABLE restaurant_admins ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can see their own membership
-- This allows "getRestaurantAdminInfo" to work for login
DROP POLICY IF EXISTS "Users can view own restaurant links" ON restaurant_admins;
CREATE POLICY "Users can view own restaurant links"
ON restaurant_admins
FOR SELECT
USING (
  auth.uid() = profile_id
);

-- Policy 2: Platform Admins can view ALL links
-- This allows the Admin Panel to list all admins for any restaurant
-- Assumes 'profiles' table has the role info and is readable
DROP POLICY IF EXISTS "Platform admins can view all restaurant links" ON restaurant_admins;
CREATE POLICY "Platform admins can view all restaurant links"
ON restaurant_admins
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'platform_admin'
  )
);

-- Policy 3: Restaurant Admins can view other admins of the SAME restaurant
-- This allows a restaurant manager to see their team
DROP POLICY IF EXISTS "Restaurant admins can view team members" ON restaurant_admins;
CREATE POLICY "Restaurant admins can view team members"
ON restaurant_admins
FOR SELECT
USING (
  restaurant_id IN (
    SELECT restaurant_id FROM restaurant_admins WHERE profile_id = auth.uid()
  )
);
