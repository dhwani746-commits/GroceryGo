# Phase 2 Quick Reference Card

## ⚡ 7-Step Quick Start

### Step 1️⃣ Create Supabase Project
```
1. Go to supabase.com
2. Create new project
3. Name: "plastikart"
4. Copy 3 keys from Project Settings → API
```

### Step 2️⃣ Update `.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
Then: `npm run dev` (restart server)

### Step 3️⃣ Create Database Tables
```
1. Go to Supabase → SQL Editor
2. New Query
3. Copy-paste from: PHASE2_DATABASE.sql
4. Click Run
5. Wait for "Query executed successfully"
```

### Step 4️⃣ Enable Row Level Security
```
1. Go to Supabase → SQL Editor
2. New Query
3. Copy-paste from: PHASE2_RLS_POLICIES.sql
4. Click Run
```

### Step 5️⃣ Add Indexes for Performance
```
1. Go to Supabase → SQL Editor
2. New Query
3. Copy-paste from: PHASE2_INDEXES.sql
4. Click Run
```

### Step 6️⃣ Create Admin User
```
1. Go to Supabase → Authentication → Users
2. Click "Add user"
3. Email: admin@plastikart.com
4. Password: (strong password)
5. Enable "Auto confirm email"
6. Click Create user

7. Go to SQL Editor → New Query
8. Paste:
   UPDATE profiles 
   SET role = 'admin' 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@plastikart.com');
9. Click Run
```

### Step 7️⃣ Verify Everything
```bash
# Test 1: Dev server should work
npm run dev
# Check http://localhost:3000 (no errors)

# Test 2: In Supabase SQL Editor, run:
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
# Should return: 6 tables (don't count sequences)

# Test 3: Check RLS enabled
# Go to Supabase → Authentication → Policies
# All tables should have "RLS enabled" badge
```

---

## 📁 Files to Reference

| File | Purpose |
|------|---------|
| `.env.local` | **Edit this first!** Add Supabase credentials |
| `PHASE2_SETUP.md` | Full detailed guide |
| `PHASE2_DATABASE.sql` | Create 7 tables - run in SQL Editor |
| `PHASE2_RLS_POLICIES.sql` | Security policies - run in SQL Editor |
| `PHASE2_INDEXES.sql` | Performance indexes - run in SQL Editor |

---

## ✅ Completion Checklist

- [ ] Supabase project created
- [ ] `.env.local` updated
- [ ] Database tables created (7 tables)
- [ ] RLS policies enabled
- [ ] Indexes added
- [ ] Admin user created
- [ ] Dev server running without errors
- [ ] Home page loads (http://localhost:3000)

---

## 🆘 Quick Troubleshooting

### Issue: "Invalid supabaseUrl"
→ Solution: Restart dev server after updating `.env.local`

### Issue: "Database connection failed"
→ Solution: Wait 2-3 minutes after creating Supabase project

### Issue: "Table already exists"
→ Solution: Delete table in Supabase and rerun script

### Issue: RLS policies not applying
→ Solution: Ensure all 6 tables have RLS enabled

---

## ⏭️ After Phase 2

Once this checklist is ✅ complete, you're ready for:

**Phase 3: Authentication (2-3 days)**
- Login/Register pages
- Password reset
- Session management
- Admin role protection

