# Phase 2: Database Setup - Step-by-Step Guide

## Prerequisites Checklist

Before starting Phase 2, ensure:
- [ ] Supabase project created at supabase.com
- [ ] Supabase API credentials obtained
- [ ] `.env.local` file updated with Supabase URL and keys
- [ ] Phase 1 development server still running

---

## Step 1: Create Supabase Project (If Not Done)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in:
   - **Project name:** plastikart
   - **Database password:** Generate a strong password
   - **Region:** Choose closest to your users (e.g., us-east-1, ap-south-1)
4. Click "Create new project" and wait 2-3 minutes for setup
5. Once ready, go to **Project Settings → API**
6. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Update `.env.local` with Supabase Credentials

**File:** `e:\plastikart\.env.local`

Replace placeholder values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Razorpay (can add later for Phase 6)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Resend (can add later for Phase 7)
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**After updating:** Restart your dev server (`npm run dev`)

---

## Step 3: Create Database Tables in Supabase

1. Go to Supabase Dashboard → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire SQL script from `PHASE2_DATABASE.sql` (see below)
5. Click **Run** (or press Ctrl+Enter)
6. Wait for confirmation "Query executed successfully"

### SQL Script to Create All Tables

**See file:** `e:\plastikart\PHASE2_DATABASE.sql`

The script creates:
- `profiles` - User profiles with roles
- `categories` - Product categories
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `promo_codes` - Discount codes

---

## Step 4: Enable Row Level Security (RLS)

1. In Supabase Dashboard → **Authentication → Policies**
2. For each table (profiles, categories, products, orders, order_items, promo_codes):
   - Click the table name
   - Click **Enable RLS** if not already enabled
3. Create policies (see `PHASE2_RLS_POLICIES.sql`)

---

## Step 5: Add Database Indexes

1. Go to **SQL Editor**
2. Create new query
3. Run SQL from `PHASE2_INDEXES.sql`

This creates indexes on:
- `products(category_id, is_deleted, is_visible)`
- `orders(customer_id, status, created_at)`
- `order_items(order_id, product_id)`
- `promo_codes(code, is_active)`

---

## Step 6: Create Admin Seed User

1. In Supabase Dashboard → **Authentication → Users**
2. Click **Add user**
3. Enter:
   - Email: `admin@plastikart.com`
   - Password: Generate a strong password
   - Auto confirm email: Enable
4. Click **Create user**
5. Go to **SQL Editor** and run:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@plastikart.com');
```

---

## Step 7: Verify Everything Works

### Test 1: Connect from Your App

In VS Code terminal:
```bash
cd e:\plastikart
npm run dev
```

Check if home page loads without Supabase errors.

### Test 2: Query from Supabase

In Supabase SQL Editor, run:
```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
```

Should return: `table_count: 7` (all 7 tables created)

### Test 3: Check RLS Policies

In Supabase Dashboard → **Authentication → Policies**, verify policies are enabled for all tables.

---

## File References

| File | Purpose |
|------|---------|
| `.env.local` | Supabase credentials (UPDATE THIS FIRST) |
| `PHASE2_DATABASE.sql` | Create all 7 tables |
| `PHASE2_RLS_POLICIES.sql` | Row Level Security policies |
| `PHASE2_INDEXES.sql` | Database indexes for performance |

---

## Troubleshooting

### Error: "Invalid supabaseUrl"
- Solution: Make sure `.env.local` has correct SUPABASE_URL
- Restart dev server after updating `.env.local`

### Error: "Database connection failed"
- Solution: Check if Supabase project is fully initialized
- Wait 2-3 minutes after creating project

### Error: "Table already exists"
- Solution: In Supabase, delete the table and rerun SQL script
- Or modify script to use `CREATE TABLE IF NOT EXISTS`

### Policies not working
- Solution: Ensure **RLS is enabled** on each table
- Run RLS policy SQL script again

---

## ✅ Phase 2 Completion Checklist

- [ ] Supabase project created
- [ ] `.env.local` updated with credentials
- [ ] 7 database tables created
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Admin user created
- [ ] Dev server running without errors
- [ ] Can access home page (http://localhost:3000)

---

## Next: Phase 3 - Authentication

After Phase 2 is complete, Phase 3 will build:
- Customer signup/login pages
- Password reset flow
- Admin role guarding
- Session management

**Est. time: 2-3 days**

