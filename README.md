Listed directory plastikart-app
Viewed README.md:1-37
Viewed package.json:1-54
Listed directory app
Listed directory %28store%29
Listed directory admin
Listed directory api
Viewed PHASE3_COMPLETE.md:1-300
Listed directory lib
Listed directory supabase
Listed directory migrations
Listed directory components
Viewed next.config.ts:1-34
Listed directory admin
Listed directory store
Listed directory razorpay
Listed directory services
Viewed ENVIRONMENT_SETUP.md:1-62
Listed directory dashboard
Listed directory admin

Now I have a thorough understanding of the project. Here's the README:

---

# PlastiKart 🛒

A mobile-first, single-seller B2C e-commerce platform for household plastic products targeting Indian consumers. PlastiKart replaces informal phone/WhatsApp-based ordering with a structured online storefront and a comprehensive admin dashboard.

---

## ✨ Features

### 🛍️ Customer Storefront
- **Product Catalog** — Browse products by category with price-range filtering, no login required
- **Product Detail Pages** — Image gallery, stock status, related products, and Add-to-Cart
- **Search** — Full-text product search
- **Cart** — Persistent cart with real-time quantity management
- **Checkout** — Address management with pincode auto-fill (India Post API), promo code application, and Razorpay payment (UPI, card, net banking)
- **Order History & Tracking** — View past orders, live status, and cancellation requests
- **Account Management** — Profile, saved addresses, and order history dashboard
- **Authentication** — Email/password signup + login via Supabase Auth, with OTP support

### 🔧 Admin Panel (`/admin`)
- **Dashboard** — Monthly revenue, top products, order funnel KPIs
- **Product Management** — Full CRUD, image uploads (Cloudinary), category assignment, stock control, bulk CSV upload
- **Order Management** — Order queue with status progression (`PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`), cancellation handling
- **Promo Codes** — Create flat/percentage discount codes with expiry, usage limits, and usage analytics
- **User Management** — View customer list and profiles
- **Transactions** — Payment ledger view
- **Store Settings** — Configurable store metadata

### 🔐 Security
- Row Level Security (RLS) on all Supabase tables — customers see only their own data
- JWT sessions via `@supabase/ssr` in `httpOnly` cookies (never `localStorage`)
- Server-side role validation — `CUSTOMER` vs `ADMIN` always read from `profiles` table, never from client requests
- Route protection via Next.js Edge Middleware for `/admin/*` and `/orders/*`
- Zod validation on all API inputs
- Razorpay webhook HMAC-SHA256 signature verification
- Idempotent order creation

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand (cart/UI) + TanStack React Query (server state) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Payments | Razorpay Standard Checkout |
| Image Storage | Cloudinary (`next-cloudinary`) |
| Email | Resend + React Email |
| Validation | Zod |
| Hosting | Vercel |

---

## 📁 Project Structure

```
plastikart-app/
├── app/
│   ├── (store)/              # Customer-facing pages
│   │   ├── products/[slug]/  # Product detail
│   │   ├── checkout/         # Checkout flow
│   │   ├── orders/           # Order history & detail
│   │   ├── account/          # Customer account
│   │   ├── addresses/        # Address management
│   │   ├── search/           # Product search
│   │   ├── cart/             # Cart page
│   │   └── auth/             # Login / register / admin-login
│   ├── admin/                # Admin panel (protected)
│   │   ├── dashboard/        # Sales KPIs
│   │   ├── products/         # Product CRUD
│   │   ├── orders/           # Order management
│   │   ├── promos/           # Promo code management
│   │   ├── users/            # Customer list
│   │   ├── transactions/     # Payment ledger
│   │   └── settings/         # Store settings
│   └── api/                  # Next.js API Route Handlers
│       ├── products/         # Product endpoints
│       ├── orders/           # Order endpoints
│       ├── promos/           # Promo validation
│       ├── razorpay/         # Payment create + verify
│       ├── admin/            # Admin-only endpoints (dashboard, orders, promos, settings, users)
│       ├── addresses/        # Address CRUD
│       ├── categories/       # Category listing
│       ├── pincode/          # India Post pincode lookup
│       └── auth/             # Signout, /me
├── components/
│   ├── store/                # Customer-facing UI components
│   ├── admin/                # Admin UI components
│   ├── shared/               # Navbar, Footer, Loaders
│   └── ui/                   # shadcn/ui base components
├── lib/
│   ├── supabase/             # browser / server / admin clients
│   ├── services/             # Business logic layer
│   ├── repositories/         # Supabase query layer
│   ├── store/                # Zustand stores (cart, auth)
│   ├── hooks/                # Custom React hooks
│   ├── validations/          # Zod schemas
│   └── utils/                # Helpers (currency, idempotency, cn)
├── supabase/
│   └── migrations/           # 21 SQL migration files (Supabase CLI)
├── middleware.ts              # Edge middleware: route protection
└── next.config.ts
```

---

## 🗄️ Database Schema

Core tables managed via Supabase CLI migrations:

| Table | Purpose |
|---|---|
| `profiles` | Linked to `auth.users`; stores name, phone, role (`CUSTOMER`/`ADMIN`) |
| `addresses` | Delivery addresses per user with pincode metadata |
| `products` | Product catalog with soft-delete, stock, and image URLs |
| `categories` | Product categories |
| `promo_codes` | Discount codes (flat/percentage) with usage tracking |
| `orders` | Orders with address snapshot, payment ID, idempotency key |
| `order_items` | Line items with product snapshot (price locked at order time) |
| `store_settings` | Configurable store-wide key-value settings |

> All monetary values stored as **integers in paise** (₹1 = 100 paise). No floating-point money.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Razorpay](https://razorpay.com) account
- A [Cloudinary](https://cloudinary.com) account (for image uploads)
- A [Resend](https://resend.com) account (for transactional email)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/plastikart-app.git
cd plastikart-app
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend (transactional email)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=orders@yourdomain.com
```

> ⚠️ **Never commit `.env.local`.** The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — keep it server-side only.

### 3. Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push
```

### 4. Seed Admin User

Create an admin user via the Supabase dashboard (Authentication → Users), then run:

```sql
-- In Supabase SQL Editor
UPDATE public.profiles
SET role = 'ADMIN'
WHERE id = 'your-admin-user-uuid';
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the storefront is live.

Admin panel: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

---

## 📜 Available Scripts

```bash
npm run dev      # Start dev server (Next.js Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Lint with ESLint
```

---

## 🔑 Key Routes

### Customer

| Route | Description |
|---|---|
| `/` | Homepage with hero, categories, product segments |
| `/products/[slug]` | Product detail page |
| `/search` | Product search |
| `/checkout` | Checkout (auth required) |
| `/orders` | Order history (auth required) |
| `/orders/[id]` | Order detail (auth required) |
| `/account` | Customer profile (auth required) |
| `/auth/login` | Customer login |
| `/auth/register` | Customer registration |

### Admin (all require `ADMIN` role)

| Route | Description |
|---|---|
| `/admin/dashboard` | Sales KPIs and revenue overview |
| `/admin/products` | Product list, create, edit, bulk upload |
| `/admin/orders` | Order queue with status management |
| `/admin/promos` | Promo code creation and analytics |
| `/admin/users` | Customer management |
| `/admin/transactions` | Payment ledger |
| `/admin/settings` | Store configuration |
| `/auth/admin-login` | Admin-only login page |

---

## 🔌 API Overview

All API routes follow a consistent response envelope:

```json
{ "success": true, "data": {}, "meta": { "page": 1, "total": 50 } }
{ "success": false, "error": { "code": "PRODUCT_NOT_FOUND", "message": "..." } }
```

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List products (with category/price filters) |
| `GET` | `/api/products/[id]` | Single product |
| `GET` | `/api/categories` | Product categories |
| `POST` | `/api/orders` | Create order (auth required, idempotent) |
| `GET` | `/api/orders` | Customer's order history (auth required) |
| `POST` | `/api/promos/validate` | Validate & apply promo code |
| `POST` | `/api/razorpay/create-order` | Create Razorpay order |
| `POST` | `/api/razorpay/verify` | Verify Razorpay payment signature |
| `GET` | `/api/admin/dashboard` | Sales stats (admin only) |
| `PATCH` | `/api/admin/orders/[id]` | Update order status (admin only) |
| `POST` | `/api/admin/products` | Create product (admin only) |
| `GET/POST` | `/api/admin/promos` | Manage promo codes (admin only) |

---

## 🏗️ Architecture

This project follows **Clean Architecture layering** within a full-stack Next.js monorepo:

```
API Route Handler  →  Service  →  Repository  →  Supabase
(HTTP, validation)   (business    (DB queries    (PostgreSQL
                      logic)       only)          + RLS)
```

- **API Routes** (`app/api/`): Parse → Validate (Zod) → Call service → Return response. No business logic.
- **Services** (`lib/services/`): Business logic only. No HTTP awareness. No direct DB access.
- **Repositories** (`lib/repositories/`): All Supabase queries. Returns typed domain objects.
- **Three Supabase clients**: `browser` (client components), `server` (RSC + API routes), `admin` (service-role, server-only).

---

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Import the repository into Vercel
2. Add all environment variables from `.env.local` in the Vercel dashboard
3. Deploy — Vercel auto-detects Next.js

### Razorpay Webhook (Production)

Configure your Razorpay webhook to point to:
```
https://your-domain.com/api/razorpay/verify
```

---

## 🗺️ Build Phases

| Phase | Status | Scope |
|---|---|---|
| Phase 1 | ✅ Complete | Project setup, Supabase DB schema, RLS policies |
| Phase 2 | ✅ Complete | Cart, checkout flow, order creation, promo validation |
| Phase 3 | ✅ Complete | Auth system, route protection, customer + admin login |
| Phase 4 | ✅ Complete | Razorpay payment integration, webhook verification |
| Enhancements | ✅ Complete | Admin dashboard, bulk product upload, order management, store settings, user management, analytics |

---

## 🔒 Security Highlights

- **RLS-first**: Default deny on all tables; explicit allow policies per role
- **No floating-point money**: All amounts stored as integer paise
- **Soft deletes**: Products use `deleted_at`; never hard-deleted
- **Address snapshots**: Order `address_snapshot` (JSONB) locks address at order time — changes to user addresses never affect historical orders
- **Product snapshots**: `order_items.product_snapshot` locks product name and price at purchase time
- **Idempotent orders**: `orders.idempotency_key` (UNIQUE) prevents duplicate order creation on retries
- **Service-role key**: Used only in `lib/supabase/admin.ts` — never client-bundled

---

## 📦 Out of Scope (V1)

Multi-vendor, cash on delivery (COD), product reviews & ratings, native mobile app, social login (Google/Facebook), coupon stacking, SMS/WhatsApp notifications, 3PL integration, GST calculation engine, loyalty points, bulk/wholesale pricing.

---

## 📄 License

This project is private and proprietary.