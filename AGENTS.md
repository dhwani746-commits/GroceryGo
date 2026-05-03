

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# instructions.md — PlastiKart E-Commerce Platform (MVP v1)

---

## 1. Project Overview

### Summary
PlastiKart is a mobile-first, single-seller B2C e-commerce platform for household plastic products targeting Indian consumers. It replaces informal phone/WhatsApp-based ordering with a structured online storefront and an admin dashboard for product, order, and promotion management.

### Key Features
- Public product catalog with category filtering (no login required to browse)
- Product detail pages with image gallery, stock status, and Add-to-Cart
- Guest-browsable cart with authenticated checkout
- User registration and login via Supabase Auth (email/phone + OTP)
- Checkout with address entry and promo code application
- Razorpay payment integration (UPI, card, net banking) — **implemented in Phase 4 only**
- Post-payment order confirmation via email
- Customer order history and status tracking dashboard
- Admin panel: full CRUD for products, order queue with status updates, promo code management with analytics
- Basic sales dashboard (monthly revenue, top products)
- Idempotent order creation

### Target Users
- **Customers**: Mobile-first household buyers (India, 22–55 yrs), medium tech comfort, price-sensitive
- **Admin**: Single business owner or 1–2 staff; low-medium tech comfort; needs a clean guided interface

### Out of Scope (V1)
Multi-vendor, COD, reviews, native app, social login, coupon stacking, SMS/WhatsApp notifications, 3PL integration, GST engine, loyalty points, bulk pricing.

### Build Phases
| Phase | Scope |
|---|---|
| **Phase 1** | Project setup, Supabase DB + Auth, product catalog (read-only), admin product CRUD |
| **Phase 2** | Cart, checkout flow (no payment), order creation, promo code validation |
| **Phase 3** | Customer order dashboard, admin order management, basic sales dashboard |
| **Phase 4** | Razorpay payment integration, webhook reconciliation, order confirmation email |

---

## 2. Tech Stack

### Recommended Stack

| Layer | Technology | Justification |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR/SSG for catalog SEO, RSC for performance, mobile-first PWA support |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, consistent design system, rapid UI development |
| State Management | Zustand + React Query (TanStack Query) | Zustand for cart/UI state; React Query for server state, caching, optimistic updates |
| Backend | Next.js API Route Handlers (TypeScript) | Co-located with frontend; single Vercel deploy; sufficient for MVP scale |
| API Style | REST | Simple CRUD-heavy domain; REST is sufficient at this scale |
| Database | Supabase (PostgreSQL) | Managed Postgres with built-in RLS, Auth, and Storage; no self-hosted infra needed |
| Auth | Supabase Auth | Handles email/phone OTP, session management, JWT issuance natively |
| File Storage | External image URLs in development; Supabase Storage or Cloudinary in production | Eliminates upload infrastructure during early development phases |
| Payments | Razorpay Standard Checkout | PRD-mandated; deferred to Phase 4 |
| Email | Supabase Auth built-in (OTP) + Resend (order confirmation) | Supabase handles OTP; Resend for custom transactional templates |
| Validation | Zod | Single source of truth for schema validation across client and server |
| Hosting | Vercel | Seamless Next.js full-stack deploy; preview deployments per branch |

### Architecture Decision: Next.js Full-Stack (No Separate Express Server)
Use **Next.js API Route Handlers** (`app/api/`) as the backend. This eliminates a second deploy target and keeps the project in a single repository. If the backend needs to scale independently post-V1, extract to a standalone service.

### Supabase Services Used
- **Database**: PostgreSQL with Row Level Security (RLS) policies
- **Auth**: Email OTP + phone OTP; session tokens issued as JWTs via `@supabase/ssr`
- **Storage** *(production only)*: Product image uploads

### Alternatives
- Database: PlanetScale — prefer Supabase for Postgres + unified auth + storage in one platform
- Auth: NextAuth.js — prefer Supabase Auth to avoid managing OTP delivery infrastructure
- Image storage (production): Cloudinary — valid alternative for built-in image transforms

---

## 3. Architecture Guidelines

### Architecture Style
**Full-stack Next.js** with **modular API Route Handlers** per domain and **Clean Architecture layering**. Each domain (products, orders, promos, admin) has its own API routes, service module, and repository. Supabase SDK is the data access layer — no ORM.

### Folder Structure

```
plastikart/
├── app/
│   ├── (store)/                          # Customer-facing route group
│   │   ├── page.tsx                      # Home / catalog
│   │   ├── products/
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Product detail
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx                  # Order history
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Order detail
│   │   └── auth/
│   │       ├── login/page.tsx
│   │       └── register/page.tsx
│   ├── (admin)/                          # Admin route group
│   │   ├── layout.tsx                    # Admin layout with auth guard
│   │   ├── dashboard/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── promos/
│   │       ├── page.tsx
│   │       └── new/page.tsx
│   ├── api/                              # Next.js API Route Handlers (backend)
│   │   ├── products/
│   │   │   ├── route.ts                  # GET, POST /api/products
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PATCH, DELETE /api/products/:id
│   │   ├── orders/
│   │   │   ├── route.ts                  # GET, POST /api/orders
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET /api/orders/:id
│   │   ├── promos/
│   │   │   ├── route.ts                  # GET, POST /api/promos (admin)
│   │   │   └── validate/route.ts         # POST /api/promos/validate
│   │   ├── admin/
│   │   │   ├── orders/route.ts           # PATCH order status
│   │   │   ├── products/route.ts
│   │   │   ├── promos/route.ts
│   │   │   └── dashboard/route.ts
│   │   └── webhooks/
│   │       └── razorpay/route.ts         # Phase 4 only
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                               # shadcn/ui base components (DO NOT edit directly)
│   ├── store/                            # Customer-facing feature components
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── CartItem.tsx
│   │   ├── CartDrawer.tsx
│   │   └── CheckoutForm.tsx
│   ├── admin/                            # Admin-specific components
│   │   ├── ProductForm.tsx
│   │   ├── OrderTable.tsx
│   │   ├── OrderStatusBadge.tsx
│   │   └── PromoForm.tsx
│   └── shared/                           # Components used in both contexts
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── LoadingSpinner.tsx
│       ├── SkeletonCard.tsx
│       └── ErrorBoundary.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client (singleton)
│   │   ├── server.ts                     # Server-side client (API routes + RSC)
│   │   └── admin.ts                      # Service-role client — server-only, bypasses RLS
│   ├── api/                              # Typed fetch functions (frontend → API routes)
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── promos.ts
│   │   └── admin.ts
│   ├── services/                         # Business logic (called by API route handlers)
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   ├── promo.service.ts
│   │   └── dashboard.service.ts
│   ├── repositories/                     # All Supabase DB queries
│   │   ├── product.repository.ts
│   │   ├── order.repository.ts
│   │   ├── promo.repository.ts
│   │   └── user.repository.ts
│   ├── store/                            # Zustand stores
│   │   ├── cartStore.ts
│   │   └── authStore.ts
│   ├── hooks/                            # Custom React hooks
│   │   ├── useCart.ts
│   │   ├── useAuth.ts
│   │   └── useProducts.ts
│   ├── validations/                      # Zod schemas (shared client + server)
│   │   ├── product.schema.ts
│   │   ├── order.schema.ts
│   │   ├── promo.schema.ts
│   │   └── common.schema.ts
│   ├── middleware/
│   │   ├── withAuth.ts                   # API route auth guard wrapper
│   │   ├── withAdmin.ts                  # API route admin guard wrapper
│   │   └── withValidation.ts             # Zod validation wrapper for API routes
│   └── utils/
│       ├── formatCurrency.ts
│       ├── idempotency.ts
│       ├── pagination.ts
│       ├── asyncHandler.ts
│       └── cn.ts                         # clsx + tailwind-merge
│
├── middleware.ts                          # Next.js edge middleware: protects /admin/* and /orders/*
├── errors/
│   ├── AppError.ts
│   └── errorCodes.ts
├── types/
│   ├── database.ts                        # Generated by: supabase gen types typescript
│   └── api.ts                             # API request/response DTOs
├── supabase/
│   ├── migrations/                        # SQL migration files (Supabase CLI)
│   └── seed.sql                           # Admin user + initial categories seed
├── .env.local.example
└── package.json
```

### Separation of Concerns
- **API Route Handler** (`app/api/`): Parse request → validate with Zod → call service → return response. No business logic. No direct DB access.
- **Service** (`lib/services/`): Business logic only. Calls repositories. No HTTP awareness. No Supabase client access.
- **Repository** (`lib/repositories/`): All Supabase queries. Returns typed domain objects. No business logic.
- **Supabase Clients** (`lib/supabase/`): Three separate instances — browser (client components), server (RSC + API routes with user session), admin/service-role (privileged server-only operations that bypass RLS).

### API Design Principles
- REST with resource-based URLs: `/api/products`, `/api/orders/:id`
- HTTP verbs: GET (read), POST (create), PATCH (partial update), DELETE (soft delete)
- Consistent response envelope:
  ```json
  { "success": true, "data": {}, "meta": { "page": 1, "total": 50 } }
  { "success": false, "error": { "code": "PRODUCT_NOT_FOUND", "message": "..." } }
  ```
- Never expose Supabase error objects or stack traces in responses
- Admin routes always prefixed `/api/admin/` and protected by `withAdmin` wrapper

---

## 4. Database Design Principles

### Supabase / PostgreSQL Schema Rules
- Use UUIDs as primary keys (`gen_random_uuid()`) — never expose sequential integer IDs to clients
- All tables have `created_at` and `updated_at` timestamps (`updated_at` managed via trigger)
- Soft deletes via `deleted_at` (nullable timestamp) for products — never hard-delete
- Store monetary values as integers in **paise** (₹1 = 100 paise) — no floating-point money
- Promo codes stored in UPPERCASE; normalize to uppercase on every write
- Enable **Row Level Security (RLS)** on all tables — default deny, explicit allow policies
- All schema changes via Supabase CLI migrations — never alter tables via the Supabase dashboard

### Naming Conventions
- Tables: `snake_case` plural nouns (`products`, `order_items`, `promo_codes`)
- Columns: `snake_case`
- Foreign keys: `<referenced_table_singular>_id` (`user_id`, `product_id`)
- Boolean columns: prefixed `is_` or `has_` (`is_active`, `is_visible`)

### Core Schema (SQL)

```sql
-- Profiles linked to Supabase Auth users
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT UNIQUE,
  role        TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  line1       TEXT NOT NULL,
  line2       TEXT,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  pincode     TEXT NOT NULL,
  is_default  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT,
  category         TEXT NOT NULL,
  price_in_paise   INT NOT NULL CHECK (price_in_paise > 0),
  stock_qty        INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  -- Development: store external image URLs (e.g. https://example.com/img.jpg)
  -- Production: replace with Supabase Storage or Cloudinary URLs
  images           TEXT[] DEFAULT '{}',
  is_visible       BOOLEAN DEFAULT true,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.promo_codes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                    TEXT UNIQUE NOT NULL,            -- always UPPERCASE
  discount_type           TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FLAT')),
  discount_value          INT NOT NULL,                    -- % (1–100) or flat paise
  expires_at              TIMESTAMPTZ,
  usage_limit             INT,
  usage_count             INT NOT NULL DEFAULT 0,
  total_discount_in_paise INT NOT NULL DEFAULT 0,
  is_active               BOOLEAN DEFAULT true,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES public.profiles(id),
  status             TEXT NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','FAILED')),
  subtotal_in_paise  INT NOT NULL,
  discount_in_paise  INT NOT NULL DEFAULT 0,
  total_in_paise     INT NOT NULL,
  promo_code_id      UUID REFERENCES public.promo_codes(id),
  address_snapshot   JSONB NOT NULL,    -- address at time of order; not a FK
  payment_id         TEXT,              -- Razorpay payment ID; populated in Phase 4
  idempotency_key    TEXT UNIQUE NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.order_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id           UUID NOT NULL REFERENCES public.products(id),
  product_snapshot     JSONB NOT NULL,  -- product name/price at time of order
  quantity             INT NOT NULL CHECK (quantity > 0),
  unit_price_in_paise  INT NOT NULL
);
```

### Row Level Security (RLS) Policies

```sql
-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin read all profiles"  ON public.profiles FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
);

-- products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible products" ON public.products FOR SELECT
  USING (is_visible = true AND deleted_at IS NULL);
CREATE POLICY "Admin full access products" ON public.products
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders"   ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access orders" ON public.orders
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- promo_codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read active promos" ON public.promo_codes FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');
CREATE POLICY "Admin full access promos" ON public.promo_codes
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');
```

### Indexing Strategy
- `products.category` — index for catalog filter queries
- `products.slug` — unique (auto-indexed)
- `orders(user_id, created_at)` — composite index for customer order history
- `orders.status` — index for admin order queue filtering
- `orders.idempotency_key` — unique (auto-indexed)
- `promo_codes.code` — unique (auto-indexed)

### Migration Strategy
- Use **Supabase CLI** exclusively: `supabase migration new <name>` → write SQL → `supabase db push`
- All migrations committed to `supabase/migrations/` in version control
- After each migration, regenerate types: `supabase gen types typescript --local > types/database.ts`
- Never mutate existing migration files — always create a new one

---

## 5. Security Requirements

### Authentication & Authorization (Supabase Auth)
- Supabase Auth manages all authentication: OTP issuance, session tokens, JWT signing
- Sessions managed by `@supabase/ssr` in `httpOnly` cookies — never in `localStorage`
- Two roles: `CUSTOMER` and `ADMIN` stored in `public.profiles.role`
- Role is always read server-side from the `profiles` table after validating the Supabase session — never trust role from client-sent request data
- Admin accounts created via `supabase/seed.sql` at deployment only — there is NO self-registration endpoint for admins
- `middleware.ts` (Next.js edge): validates Supabase session on all `/admin/*` and `/orders/*` routes; redirects unauthenticated users to `/auth/login`
- `withAdmin` wrapper: verifies `role = 'ADMIN'` via service-role client; returns 403 if not
- `withAuth` wrapper: verifies valid Supabase session; returns 401 if missing

### Input Validation
- Validate ALL inbound request bodies and query params with Zod before they reach the service layer
- Use `withValidation(schema)` wrapper on all API route handlers that accept input
- Never pass raw `request.json()` to a service function without parsing through a Zod schema

### Protection Against Common Attacks

**SQL Injection**
- Use Supabase JS SDK exclusively — all queries are parameterized internally
- If raw SQL is required, use Supabase `rpc()` calling a server-side PostgreSQL function — never string-concatenate user input into SQL

**XSS**
- Never use `dangerouslySetInnerHTML`; if unavoidable, sanitize with `DOMPurify`
- Set `Content-Security-Policy` in `next.config.js` headers
- User-generated text stored as plain text; escaped at render time by React

**CSRF**
- `SameSite=Lax` cookie attribute on Supabase sessions provides CSRF protection
- All state-changing routes require a valid Supabase session — CSRF cannot forge session cookies cross-origin

**Security Headers (`next.config.js`)**
```javascript
headers: [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
]
```

### Environment Variable Handling
- Validate all required env vars at startup with Zod in `lib/config/env.ts` — fail fast if missing
- Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — NEVER prefix with `NEXT_PUBLIC_`; NEVER referenced in client components
- Only commit `.env.local.example` with placeholder values — never `.env.local`
- Production secrets set in Vercel environment variables dashboard

### Rate Limiting
- Use `@upstash/ratelimit` with Upstash Redis on sensitive API routes
- Auth endpoints: 10 requests / 15 min per IP
- Order creation: 5 requests / 10 min per user
- Return `429 Too Many Requests` with `Retry-After` header

### Razorpay Webhook Security *(Phase 4)*
- Verify every webhook by validating `x-razorpay-signature` HMAC-SHA256 against the raw request body
- Read raw body as `Buffer` before JSON parsing — signature verification requires raw bytes
- Process webhooks idempotently: check `payment_id` against existing orders before updating state
- Webhook route uses Razorpay signature verification, not Supabase session auth

### Supabase Key Security
- `anon` key: safe to expose in client — restricted by RLS policies
- `service_role` key: bypasses RLS — ONLY used in `lib/supabase/admin.ts` server-side; never bundled client-side

---

## 6. Coding Standards

### Language
- TypeScript strict mode for all code
- `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitReturns": true`
- Import DB types from `types/database.ts` (generated by Supabase CLI) — never write manual DB row types

### Naming Conventions
- Files: `kebab-case.ts` for modules; `PascalCase.tsx` for components
- Classes and interfaces: `PascalCase`
- Functions, variables: `camelCase`
- DB columns in SQL: `snake_case`; mapped to `camelCase` in TypeScript DTOs
- Env vars: `SCREAMING_SNAKE_CASE`
- Custom hooks: `useCamelCase`

### Error Handling
- Define typed `AppError`: `{ statusCode: number, code: string, message: string }`
- All API route handlers wrapped with `withErrorHandler` — catches `AppError`, returns structured JSON
- Unexpected errors: log with `console.error` (Vercel captures); return generic 500 to client
- Never surface Supabase error codes or messages in API responses

### Logging
- Use `console.error` / `console.warn` / `console.info` (Vercel log drain captures these)
- Always include structured context: `{ route, userId, errorCode }`
- Never log: passwords, OTPs, payment data, Supabase service role key

### Reusability
- Extract logic used more than twice into `lib/utils/`
- `lib/api/` functions are the single source of truth for frontend→API communication — never `fetch` directly in components
- Use React Query hooks wrapping `lib/api/` functions

---

## 7. Performance & Scalability

### Image Strategy

**Development**
- Product `images` column stores plain external URL strings (e.g., stock photo sites, manufacturer pages)
- No upload infrastructure needed in Phases 1–3
- Use `next/image` with `unoptimized` prop for external URLs not on the allowed domains list
- Add all dev image hostnames to `next.config.js`:
  ```javascript
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: '**.pexels.com' },
      // add others as needed during development
    ]
  }
  ```
- Product form image input in dev is a **URL text field** — not a file picker

**Production**
- Replace external URLs with Supabase Storage or Cloudinary URLs
- DB schema is identical — only URL values change; no component code changes required
- Add production storage domain to `remotePatterns` and remove dev-only domains

### Caching
- Next.js ISR: product catalog pages revalidate every 60 seconds
- React Query: `staleTime: 60 * 1000` for catalog; `staleTime: 0` for order status
- Do not cache user-specific data (orders, cart) in shared server cache

### Pagination
- All list endpoints use Supabase `.range(from, to)` for offset pagination
- Default page size: 20; maximum: 100
- Always return `meta: { total, page, pageSize, hasNextPage }` in list responses

### Lazy Loading
- `next/image` for all product images
- `next/dynamic` for heavy admin components (charts, data tables)
- Next.js `<Link prefetch>` for product detail pages on catalog hover

### API Optimization
- Always use `.select('col1, col2')` — never `.select('*')` in production
- Push all filters into Supabase query builder — never over-fetch and filter in JavaScript
- `Promise.all` for independent async Supabase queries

---

## 8. State Management (Frontend)

### Zustand — Client-Only State
Use for: shopping cart contents, UI state (modals, drawers, toast queue)

- `cartStore.ts`: cart state with `localStorage` persistence via Zustand `persist` middleware
- Guest cart survives page refresh; on login, reconcile guest cart with server state
- Do not store auth state in Zustand

### React Query (TanStack Query) — Server State
Use for: all API data (products, orders, promo validation, admin data)

- Query keys: structured arrays `['products', { category, page }]`
- `staleTime: 60 * 1000` for catalog; `staleTime: 0` for order status
- `useMutation` for writes; invalidate related keys on success
- Never store API response data in Zustand

### Supabase Auth State
- Use `supabase.auth.getUser()` and `onAuthStateChange` in root layout
- Expose via `useAuth` custom hook: `{ user, session, loading, signOut }`
- Auth state is derived from Supabase session — do not duplicate in Zustand

### When NOT to Use Global State
- Form state → `react-hook-form`
- Component-local ephemeral state → `useState`

---

## 9. UI/UX Guidelines

### Responsive Design
- Mobile-first: design for 375px viewport; expand for 768px (tablet), 1280px (desktop)
- All touch targets minimum 44×44px
- Test all critical flows at 375px width

### Accessibility
- All interactive elements must have accessible labels
- Color contrast minimum 4.5:1 for normal text; 3:1 for large text
- All form inputs paired with visible `<label>` elements
- Focus indicators always visible — never `outline: none` without a visible replacement
- `alt` text on all product images; `alt=""` on decorative images

### Component Reusability
- All UI primitives from `shadcn/ui` — do not reinvent buttons, dialogs, inputs
- `components/ui/` files are NOT to be edited — extend via wrapper components in `components/store/` or `components/admin/`
- `components/shared/` components must have zero domain-specific logic

### Design System
- Color tokens, spacing, typography defined in `tailwind.config.ts`
- Never use raw hex colors — always use Tailwind semantic tokens (`text-primary`, `bg-destructive`)
- Currency: always `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`
- Every data-fetching UI must render a skeleton loader (`SkeletonCard`) — never a blank screen

---

## 10. Deployment

### Environment Setup

| Environment | Purpose | Config |
|---|---|---|
| `development` | Local development | `.env.local`; Supabase local dev stack via Supabase CLI |
| `production` | Live | Secrets in Vercel environment variables; production Supabase project |

### Local Development with Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Initialise (first time only)
supabase init

# Start local Supabase stack (Postgres + Auth + Storage emulator)
supabase start

# Apply all migrations to local DB
supabase db push

# Seed admin user and categories
supabase db seed

# Regenerate TypeScript types after schema changes
supabase gen types typescript --local > types/database.ts

# Run the Next.js dev server
npm run dev
```

No additional Docker setup is required by the developer — Supabase CLI manages the local DB stack internally.

### Hosting
- **Full-stack**: Vercel (Next.js API routes + frontend in a single deploy)
- **Database + Auth + Storage**: Supabase cloud project
- **Rate limiting** *(if needed)*: Upstash Redis (serverless; Vercel integration available)

### Deployment Checklist (Before Go-Live)
- [ ] All environment variables set in Vercel project settings
- [ ] Supabase production project created; all migrations applied
- [ ] RLS policies verified on all tables in production
- [ ] `supabase gen types` run against production schema; types committed
- [ ] Admin user seeded in Supabase Auth + `profiles` table
- [ ] CORS settings in Supabase dashboard restricted to production domain
- [ ] Supabase Auth email templates customized (OTP, confirmation)
- [ ] `next.config.js` `images.remotePatterns` updated for production image domains (remove dev-only hosts)
- [ ] Razorpay webhook URL configured *(Phase 4 only)*

---

## 11. Testing Strategy

### Unit Tests (Jest + ts-jest)
- Test all service-layer functions in isolation; mock repositories with `jest.fn()`
- Test all Zod schemas: valid inputs pass; invalid inputs return correct error shapes
- Test utility functions: currency formatting, promo discount calculation, idempotency key generation
- Coverage target: ≥ 80% for service layer

### Integration Tests (Jest + Supertest or fetch)
- Test API route handlers against a local Supabase instance (`supabase start`)
- Truncate tables between test files
- Critical paths: OTP login flow, product CRUD, order creation with promo code, stock decrement
- Edge cases from PRD: duplicate order (idempotency), expired promo code, out-of-stock at checkout

### E2E Tests (Playwright)
- Run against a Vercel preview deployment
- Cover complete user journeys:
  - Guest browse → add to cart → register → login → checkout → order confirmation *(payment mocked until Phase 4)*
  - Admin login → create product → create promo code → update order status
  - Phase 4 addition: full Razorpay test-mode payment flow
- Test on mobile viewport (375px) via Playwright device presets

### Testing Rules
- No test depends on state left by another test
- Test behavior and outcomes — not implementation details
- Mock Resend and Razorpay in unit and integration tests — only hit real services in E2E

---

## 12. AI Coding Instructions

These rules are mandatory for all AI-generated code in this project.

### Structure Rules
- ALWAYS place files in the correct folder per Section 3
- NEVER create logic files at the project root — every file belongs in a named module
- NEVER mix API route handler, service, and repository logic in one file
- ALWAYS create a corresponding Zod schema in `lib/validations/` when adding a new domain

### Supabase Client Rules
- ALWAYS use the correct Supabase client for the context:
  - `lib/supabase/client.ts` → client components only
  - `lib/supabase/server.ts` → Server Components, API route handlers, middleware
  - `lib/supabase/admin.ts` → privileged server-only operations (bypasses RLS); NEVER in client components
- NEVER import `lib/supabase/admin.ts` in any file that could be bundled client-side
- ALWAYS call `supabase.auth.getUser()` server-side to verify identity in API routes — never trust `userId` from request body
- ALWAYS use `.select('col1, col2')` — never `.select('*')`
- NEVER filter query results in JavaScript — always push filters into the Supabase query builder

### Image Rules
- In development, product image fields store external URL strings — NEVER implement file upload in dev phases
- The product form image input is a **URL text field** during Phases 1–3
- ALWAYS add new external image hostnames to `next.config.js` `images.remotePatterns` before use
- File upload UI is a Phase 4+ concern after production image hosting is confirmed

### Payment Rules
- DO NOT implement any Razorpay code until Phase 4 is explicitly started
- In Phases 1–3, checkout ends with order creation in `PENDING` status — no payment step exists
- In Phase 4: implement Razorpay order creation API call → Standard Checkout → webhook signature verification → order status update

### Validation Rules
- ALWAYS validate with Zod before passing data to service layer
- NEVER pass raw `request.json()` to a service function
- ALWAYS use `withValidation(schema)` on mutation API routes

### Error Handling Rules
- ALWAYS wrap API route handlers with `withErrorHandler`
- ALWAYS throw `AppError` from service/repository layers — never raw `new Error()`
- NEVER `console.log` — use `console.error` / `console.warn` / `console.info` with structured context
- ALWAYS handle `null` returns from Supabase queries (row not found)
- NEVER expose Supabase error objects in API responses

### Database Rules
- NEVER concatenate user input into Supabase queries
- ALWAYS use Supabase SDK query builder
- ALWAYS use a Supabase Postgres function via `rpc()` for operations that must be atomic across multiple tables (order creation + stock decrement + promo usage increment)
- ALWAYS verify stock availability inside the atomic transaction, not before it

### Frontend Rules
- NEVER call `fetch` directly in a component — use `lib/api/` functions
- NEVER store server state in Zustand — use React Query
- Use relative API paths (`/api/products`) — frontend and API are co-located on Vercel; no base URL needed
- ALWAYS handle loading and error states for every `useQuery` call with skeleton and error UI
- NEVER use `dangerouslySetInnerHTML`

### General Rules
- NEVER hardcode API keys, secrets, or environment-specific URLs — read from `process.env`
- NEVER commit `.env.local`
- ALWAYS write single-responsibility functions — no function longer than 40 lines
- ALWAYS add JSDoc comments to exported functions and types
- PREFER named exports over default exports for non-component modules
- ALWAYS paginate list queries — never fetch unbounded result sets

---

## 13. Constraints & Anti-Patterns

### The AI MUST NOT do the following:

| Anti-Pattern | Why It Is Forbidden |
|---|---|
| Import `lib/supabase/admin.ts` in a client component or page | Service-role key exposed to browser — critical security breach |
| Use `.select('*')` in Supabase queries | Fetches unnecessary columns; leaks schema; hurts performance |
| Filter Supabase results in JavaScript after fetching | Always push filters into `.eq()`, `.in()`, `.range()` |
| Trust `role` or `userId` from the request body | Always derive identity from `supabase.auth.getUser()` server-side |
| Generate `any` types in TypeScript | Use DB types from `types/database.ts`; use `unknown` for unknown shapes |
| Store Supabase session in `localStorage` | Sessions managed by `@supabase/ssr` in `httpOnly` cookies |
| Use `eval()` or `new Function()` | Remote code execution risk |
| Write business logic in API route handlers | Violates separation of concerns; makes code untestable |
| Implement Razorpay in Phase 1, 2, or 3 | Payment is explicitly deferred to Phase 4 |
| Implement file upload UI for product images during dev phases | Dev uses URL strings; upload is a Phase 4+ production concern |
| Return Supabase error objects in API responses | Map to `AppError`; log internally; return opaque messages |
| Create admin accounts via any API endpoint | Admins are seeded via `supabase/seed.sql` only |
| Allow a single order to use multiple promo codes | PRD prohibits coupon stacking — enforce in service layer |
| Hard-delete products that have associated orders | Soft delete only via `deleted_at` |
| Use floating-point arithmetic for monetary values | All money stored and computed as integer paise |
| Skip the idempotency key check on order creation | Duplicate orders are a critical business defect |
| Disable RLS on any Supabase table | RLS is the primary data access control layer |
| Write raw SQL in application code outside migrations | Use SDK query builder; complex logic goes in Postgres functions via `rpc()` |
| Fetch unbounded result sets without `.range()` or `.limit()` | Always paginate |
| Use `*` in CORS settings in production | Restrict to production domain in Supabase project settings |