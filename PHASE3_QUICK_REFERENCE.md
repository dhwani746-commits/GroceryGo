# Phase 3 Quick Reference Card

## ⚡ 8-Step Quick Start

### Step 1️⃣ Create AuthForm Component
**File:** `src/components/AuthForm.tsx`
→ See PHASE3_SETUP.md for full code

### Step 2️⃣ Update Login Page
**File:** `src/app/(auth)/login/page.tsx`
→ Import AuthForm, set mode="login"

### Step 3️⃣ Update Register Page
**File:** `src/app/(auth)/register/page.tsx`
→ Import AuthForm, set mode="register"

### Step 4️⃣ Create Admin Login Page
**File:** `src/app/(auth)/admin-login/page.tsx`
→ Import AuthForm, set mode="login" isAdmin={true}

### Step 5️⃣ Create Session Utilities
**File:** `src/lib/auth/session.ts`
→ getSession(), getCurrentUser(), isAdmin(), etc.

### Step 6️⃣ Create Auth Context (Optional)
**File:** `src/lib/auth/context.tsx`
→ Provides user state on client-side

### Step 7️⃣ Update Root Layout
**File:** `src/app/layout.tsx`
→ Wrap with `<AuthProvider>`

### Step 8️⃣ Create API Endpoints
- `src/app/api/auth/signout/route.ts` - Sign out
- `src/app/api/auth/me/route.ts` - Get current user

---

## 🧩 Components to Create

| Component | File | Purpose |
|-----------|------|---------|
| AuthForm | `src/components/AuthForm.tsx` | Login/signup form |
| Header | `src/components/Header.tsx` | Nav with auth links |
| (Pages) | `src/app/(auth)/*` | Login, register pages |
| (Session) | `src/lib/auth/session.ts` | Auth helpers |
| (Context) | `src/lib/auth/context.tsx` | Client-side auth state |

---

## 🔑 Key Features

✅ Email + password authentication
✅ Customer sign-up with OTP
✅ Customer login
✅ Admin login (role-based)
✅ Password reset ready (Phase 3+)
✅ Session management
✅ Route protection via middleware
✅ Role-based access control

---

## 🧪 Testing Checklist

- [ ] Sign up as new customer → confirmation email sent
- [ ] Log in as customer → redirects to home
- [ ] Log in as admin (admin@plastikart.com) → redirects to /admin/dashboard
- [ ] Access /checkout without login → redirects to /auth/login
- [ ] Access /admin/dashboard as customer → redirects to home
- [ ] Sign out button works → redirects to home
- [ ] Header shows user name when logged in
- [ ] Header shows login/signup links when logged out

---

## 📁 File Structure After Phase 3

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx           ✅ Updated
│   │   ├── register/page.tsx        ✅ Updated
│   │   └── admin-login/page.tsx     ✅ New
│   ├── api/auth/
│   │   ├── signout/route.ts         ✅ New
│   │   └── me/route.ts              ✅ New
│   └── layout.tsx                   ✅ Updated (AuthProvider)
├── components/
│   ├── AuthForm.tsx                 ✅ New
│   └── Header.tsx                   ✅ New
└── lib/auth/
    ├── session.ts                   ✅ New
    ├── context.tsx                  ✅ New
    └── helpers.ts                   (existing)

```

---

## 🚨 Common Issues & Solutions

### Issue: "Unauthorized" error on API calls
**Solution:** Check that Supabase credentials in `.env.local` are correct

### Issue: OTP email not received
**Solution:** Check spam folder, or use Supabase email testing

### Issue: Admin login not working
**Solution:** Verify admin@plastikart.com has `role = 'admin'` in profiles table

### Issue: Route protection not working
**Solution:** Restart dev server after changes

### Issue: AuthProvider errors
**Solution:** Make sure AuthProvider wraps all children in layout

---

## 🎯 Implementation Order

1. **Create AuthForm component** (most important)
2. Update auth pages (login, register, admin-login)
3. Create session utilities
4. Create Auth context (for client-side state)
5. Create API endpoints for signout & me
6. Create Header component
7. Add Header to pages
8. Test everything

---

## ✅ Phase 3 Done When:

- [ ] Can sign up new customer
- [ ] Can log in as customer
- [ ] Can log in as admin (different redirect)
- [ ] Protected routes redirect to login
- [ ] Header shows user when logged in
- [ ] Sign out works
- [ ] All tests pass

---

## ⏭️ What's Next?

**Phase 4: Product Catalog** (3-4 days)
- Product listing & filtering
- Product detail page
- Admin product CRUD
- Image uploads

