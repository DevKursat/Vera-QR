# VERA-QR Deployment Guide

## Pre-Deployment Checklist

### 1. Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Migrations**
   - Open SQL Editor in Supabase Dashboard
   - Copy and execute `supabase/migrations/20240101000000_initial_schema.sql`
   - Copy and execute `supabase/migrations/20240101000001_rls_policies.sql`
   - (Optional) Execute `supabase/seed.sql` for demo data

3. **Configure Storage**
   - Create two buckets:
     - `logos` (for restaurant logos)
     - `menu-images` (for menu item photos)
   - Set both to public access for reading

4. **Get Service Role Key**
   - Go to Settings → API
   - Copy the `service_role` key (keep it secret!)

### 2. OpenAI Setup

1. **Get API Key**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create an API key
   - Ensure you have credits/payment method set up

2. **Test API Access**
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

### 3. Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=https://veraqr.com
PLATFORM_ADMIN_EMAIL=admin@veraqr.com
```

## Vercel Deployment

### Option 1: Deploy via Git (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables**
   - In Vercel project settings
   - Add all variables from `.env.local`
   - Apply to Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all other variables

# Deploy to production
vercel --prod
```

## Custom Domain Setup

1. **Add Domain in Vercel**
   - Project Settings → Domains
   - Add your domain (e.g., veraqr.com)

2. **Configure DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel nameservers for full DNS management

3. **Enable SSL**
   - Automatic via Vercel (Let's Encrypt)

## Post-Deployment

### 1. Create Platform Admin Account

```bash
# Connect to your Supabase database via SQL Editor

INSERT INTO admin_users (email, password_hash, full_name, role)
VALUES (
  'admin@veraqr.com',
  crypt('YOUR_SECURE_PASSWORD', gen_salt('bf')),
  'Platform Administrator',
  'platform_admin'
);
```

**Note**: Replace bcrypt hashing if your Supabase doesn't have pgcrypto extension. Use a proper password hashing library.

### 2. Test Core Features

- [ ] Home page loads correctly
- [ ] Can access restaurant page via slug (e.g., `/bella-italia`)
- [ ] Menu items display properly
- [ ] AI Assistant responds to messages
- [ ] Can add items to cart
- [ ] Order submission works
- [ ] QR codes generate correctly

### 3. Create Test Restaurant

Use the admin panel (to be built) or directly via SQL:

```sql
INSERT INTO organizations (name, slug, description, brand_color, status)
VALUES (
  'Test Restaurant',
  'test-restaurant',
  'A test restaurant for verification',
  '#000000',
  'active'
);
```

### 4. Monitor & Optimize

1. **Error Tracking**
   - Set up Sentry (optional)
   - Monitor Vercel logs
   - Check Supabase logs

2. **Performance**
   - Enable Vercel Analytics
   - Monitor Core Web Vitals
   - Check OpenAI usage/costs

3. **Database**
   - Monitor Supabase dashboard
   - Check query performance
   - Set up database backups

## Environment-Specific Notes

### Development
```bash
npm run dev
# Runs on http://localhost:3000
```

### Preview (Staging)
- Automatic on each PR
- Uses preview environment variables
- Full production-like testing

### Production
- Main branch auto-deploys
- Uses production environment variables
- Public URL

## Scaling Considerations

### Database
- Upgrade Supabase plan as needed
- Add read replicas for high traffic
- Optimize queries with indexes

### API Limits
- OpenAI: Monitor token usage
- Implement rate limiting per organization
- Cache frequent AI responses

### Storage
- Optimize images before upload
- Use CDN for static assets
- Implement image lazy loading

## Backup Strategy

1. **Database Backups**
   - Supabase auto-backups (daily)
   - Download manual backups regularly
   - Store off-site (S3, Google Cloud Storage)

2. **Code**
   - GitHub as source of truth
   - Tag releases
   - Keep deployment history

3. **Environment Variables**
   - Document all variables
   - Store securely (1Password, etc.)
   - Version control `.env.example`

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback DEPLOYMENT_URL
```

### Database
- Use Supabase point-in-time recovery
- Or restore from manual backup

## Support & Troubleshooting

### Common Issues

**Build Fails**
- Check Node.js version (18+)
- Verify all environment variables
- Check TypeScript errors

**Database Connection Errors**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure migrations ran successfully

**AI Assistant Not Responding**
- Verify OpenAI API key
- Check API usage limits
- Review rate limits

**Images Not Loading**
- Check Supabase storage buckets
- Verify public access policies
- Check image URLs

### Getting Help

- Check Vercel logs
- Review Supabase logs
- Open GitHub issue
- Contact support@veraqr.com

## Security Checklist

- [ ] Environment variables are secret
- [ ] Service role key is never exposed to client
- [ ] RLS policies are properly configured
- [ ] Rate limiting is implemented
- [ ] HTTPS is enforced
- [ ] CORS is configured correctly
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection enabled

## Cost Estimation

### Vercel (Hobby/Pro)
- **Hobby**: $0/month (hobby projects)
- **Pro**: $20/month per member

### Supabase
- **Free**: $0 (up to 500MB database, 1GB storage)
- **Pro**: $25/month (8GB database, 100GB storage)
- **Team**: $599/month (custom limits)

### OpenAI
- **GPT-4**: ~$0.03 per 1K tokens input, ~$0.06 per 1K tokens output
- Average cost per conversation: $0.05-0.15
- Monthly estimate for 1000 conversations: $50-150

### Total Monthly Cost (Estimate)
- **Small Restaurant (Starter)**: $25-75/month
- **Medium Restaurant (Pro)**: $100-200/month
- **Enterprise Chain**: $600+/month

---

🎉 **Congratulations!** Your VERA-QR platform is now deployed and ready to serve restaurants!
