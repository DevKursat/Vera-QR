# VERA-QR Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
npm install
```

### Step 2: Set Up Supabase (2 min)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization, enter project name, database password
   - Wait for project to be ready (~30 seconds)

2. **Get Credentials**
   - Go to Settings → API
   - Copy "Project URL"
   - Copy "anon public" key
   - Copy "service_role" key (keep secret!)

3. **Run Migrations**
   - Go to SQL Editor
   - Copy contents of `supabase/migrations/20240101000000_initial_schema.sql`
   - Paste and click "Run"
   - Copy contents of `supabase/migrations/20240101000001_rls_policies.sql`
   - Paste and click "Run"
   - ✅ Done!

4. **(Optional) Load Demo Data**
   - Copy contents of `supabase/seed.sql`
   - Paste and click "Run"
   - This creates 3 test restaurants with menus

### Step 3: Get OpenAI API Key (1 min)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys
4. Click "Create new secret key"
5. Copy the key (save it securely!)

### Step 4: Configure Environment (1 min)

```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local with your credentials
```

Your `.env.local` should look like:

```env
# Supabase (from Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (from Step 3)
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_ADMIN_EMAIL=admin@veraqr.com
```

### Step 5: Run the App! (< 1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Test the Application

### Option A: With Demo Data (If you ran seed.sql)

1. **Visit a Restaurant Page**
   ```
   http://localhost:3000/bella-italia
   http://localhost:3000/sushi-master
   http://localhost:3000/burger-house
   ```

2. **Test Features**
   - ✅ Browse menu items
   - ✅ Click AI assistant icon (💬)
   - ✅ Chat: "What pizzas do you have?"
   - ✅ Add items to cart
   - ✅ Place an order

### Option B: Without Demo Data (Clean install)

Create a test restaurant manually:

```sql
-- In Supabase SQL Editor

INSERT INTO organizations (name, slug, description, brand_color, status)
VALUES (
  'My Test Restaurant',
  'my-test-restaurant',
  'A beautiful test restaurant',
  '#FF6B6B',
  'active'
) RETURNING id;

-- Note the returned ID, use it below

INSERT INTO menu_categories (organization_id, name, display_order)
VALUES 
  ('YOUR-ORG-ID-HERE', 'Main Dishes', 1),
  ('YOUR-ORG-ID-HERE', 'Drinks', 2);

-- Get category IDs
SELECT id, name FROM menu_categories WHERE organization_id = 'YOUR-ORG-ID-HERE';

INSERT INTO menu_items (organization_id, category_id, name, description, price, available)
VALUES
  ('YOUR-ORG-ID-HERE', 'CATEGORY-ID-1', 'Delicious Pizza', 'Cheese and tomato', 89.99, true),
  ('YOUR-ORG-ID-HERE', 'CATEGORY-ID-1', 'Tasty Burger', 'Beef patty with fries', 79.99, true),
  ('YOUR-ORG-ID-HERE', 'CATEGORY-ID-2', 'Fresh Lemonade', 'Homemade lemonade', 25.00, true);
```

Then visit: `http://localhost:3000/my-test-restaurant`

## 🔍 Verify Everything Works

### ✅ Checklist

- [ ] Home page loads (`http://localhost:3000`)
- [ ] Restaurant page loads (`http://localhost:3000/{slug}`)
- [ ] Menu items display correctly
- [ ] AI assistant responds to questions
- [ ] Can add items to cart
- [ ] Cart shows correct quantities and totals
- [ ] Can place an order (check browser console for success)
- [ ] No console errors

### 🐛 Troubleshooting

**"Module not found" errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Invalid Supabase credentials"**
- Double-check your .env.local
- Ensure no extra spaces
- Restart dev server: `npm run dev`

**AI Assistant not responding**
- Verify OpenAI API key is correct
- Check you have credits/payment method set up
- Check browser console for errors

**Database errors**
- Verify migrations ran successfully
- Check Supabase logs in dashboard
- Ensure RLS policies are enabled

**Build errors**
```bash
npm run type-check  # Check TypeScript errors
npm run lint        # Check linting errors
```

## 📱 Test on Mobile

1. **Find your local IP**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Access from mobile**
   ```
   http://YOUR-LOCAL-IP:3000/bella-italia
   ```

3. **Scan QR Code** (if you have tables set up)
   - Generate QR via API
   - Scan with phone camera
   - Should open restaurant page

## 🚀 Deploy to Production

Ready to deploy? Follow **DEPLOYMENT.md** for detailed instructions.

Quick deploy with Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables (one by one)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

## 📚 Next Steps

1. **Explore the Code**
   - Check `app/[slug]/page.tsx` for customer page
   - Check `app/api/` for backend APIs
   - Check `components/customer/` for UI components

2. **Read Documentation**
   - `README.md` - Project overview
   - `DEPLOYMENT.md` - Deployment guide
   - `PROJECT_SUMMARY.md` - Detailed summary

3. **Build Admin Panels** (Phase 2)
   - Platform admin dashboard
   - Restaurant admin panel
   - Menu management UI
   - Order dashboard

4. **Add Features**
   - Authentication
   - Payment processing
   - Email notifications
   - Advanced analytics

## 💡 Pro Tips

1. **Use the demo data** - It's much faster to test with pre-populated restaurants
2. **Keep dev server running** - Hot reload makes development super fast
3. **Check browser console** - Most errors will show up there
4. **Use TypeScript** - It catches errors before runtime
5. **Read the code** - The codebase is well-commented and structured

## 🎉 Success!

If you see the menu page with items and the AI assistant responds, **congratulations!** You've successfully set up VERA-QR.

### What You Can Do Now

✅ Browse restaurant menus  
✅ Chat with AI assistant  
✅ Add items to cart  
✅ Place orders  
✅ Generate QR codes  
✅ Track analytics  

### What's Next

🚧 Build admin panels  
🚧 Add authentication  
🚧 Implement payments  
🚧 Deploy to production  
🚧 Onboard real restaurants  

---

**Need Help?**
- Check the troubleshooting section above
- Read the full documentation in README.md
- Check the code - it's well-commented
- Open an issue on GitHub
- Email: support@veraqr.com

**Happy Coding! 🎊**
