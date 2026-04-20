-- PlastiKart Phase 2: Database Indexes
-- Create indexes for optimal query performance

-- ============================================================
-- Products Table Indexes
-- ============================================================

-- Index for filtering products by category
CREATE INDEX IF NOT EXISTS idx_products_category_id 
  ON public.products(category_id);

-- Index for filtering by is_deleted and is_visible
CREATE INDEX IF NOT EXISTS idx_products_deleted_visible 
  ON public.products(is_deleted, is_visible);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_products_slug 
  ON public.products(slug);

-- ============================================================
-- Orders Table Indexes
-- ============================================================

-- Index for fetching customer orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_id 
  ON public.orders(customer_id);

-- Index for filtering orders by status
CREATE INDEX IF NOT EXISTS idx_orders_status 
  ON public.orders(status);

-- Index for filtering orders by date
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON public.orders(created_at);

-- Composite index for common query: customer + status + date
CREATE INDEX IF NOT EXISTS idx_orders_customer_status_date 
  ON public.orders(customer_id, status, created_at DESC);

-- ============================================================
-- Order Items Table Indexes
-- ============================================================

-- Index for finding items by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON public.order_items(order_id);

-- Index for finding items by product
CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
  ON public.order_items(product_id);

-- ============================================================
-- Promo Codes Table Indexes
-- ============================================================

-- Index for code lookups (note: UNIQUE constraint already creates an index)
CREATE INDEX IF NOT EXISTS idx_promo_codes_code 
  ON public.promo_codes(code);

-- Index for active promos
CREATE INDEX IF NOT EXISTS idx_promo_codes_active 
  ON public.promo_codes(is_active);

-- Composite index for common query: active + not expired
CREATE INDEX IF NOT EXISTS idx_promo_codes_active_expiry 
  ON public.promo_codes(is_active, expires_at);

-- ============================================================
-- Profiles Table Indexes
-- ============================================================

-- Index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON public.profiles(role);

-- ============================================================
-- Categories Table Indexes
-- ============================================================

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug 
  ON public.categories(slug);

-- ============================================================
-- Verify Indexes Created
-- ============================================================

-- Run this query to see all indexes:
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
