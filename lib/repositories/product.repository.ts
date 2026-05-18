import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Product } from '@/lib/store/products';

export interface PaginatedProducts {
  data: Product[];
  total: number;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export interface ProductFilters {
  sort?: SortOption;
  category?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

const SELECT_COLS = 'id, name, slug, price, original_price, discount_percentage, description, image_urls, stock_quantity, category';

export class ProductRepository {
  /**
   * Fetch a single product by slug for the public detail page.
   *
   * Uses the service-role client (bypasses RLS) so that out-of-stock products
   * and admin-hidden products are still accessible on their detail page —
   * the page itself renders the stock/visibility state correctly.
   * The only case that returns null is a hard-deleted product (deleted_at IS NOT NULL).
   */
  static async getProductBySlug(slug: string): Promise<Product | null> {
    // Service-role client bypasses the "is_visible = true" RLS policy so that
    // hidden/OOS products still resolve to a detail page instead of a 404.
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select(SELECT_COLS)
      .eq('slug', slug)
      .is('deleted_at', null)   // hard-deleted products are truly gone
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // no row found
      throw error;
    }
    return data;
  }

  static async getAllProducts(): Promise<Product[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('products')
      .select(SELECT_COLS)
      .eq('is_visible', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getProductsPaginated(
    page: number,
    perPage: number,
    filters: ProductFilters = {},
  ): Promise<PaginatedProducts> {
    const supabase = await createServerClient();
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let q = supabase
      .from('products')
      .select(SELECT_COLS, { count: 'exact' })
      .eq('is_visible', true)
      .is('deleted_at', null);

    if (filters.category) q = q.eq('category', filters.category);
    if (filters.inStock)  q = q.gt('stock_quantity', 0);
    if (filters.minPrice !== undefined) q = q.gte('price', filters.minPrice);
    if (filters.maxPrice !== undefined) q = q.lte('price', filters.maxPrice);

    const sort = filters.sort ?? 'newest';
    if (sort === 'price_asc')  q = q.order('price', { ascending: true });
    else if (sort === 'price_desc') q = q.order('price', { ascending: false });
    else q = q.order('created_at', { ascending: false });

    const { data, error, count } = await q.range(from, to);

    if (error) throw error;
    return { data: data ?? [], total: count ?? 0 };
  }

  static async searchProducts(query: string): Promise<Product[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('products')
      .select(SELECT_COLS)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('is_visible', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async searchProductsPaginated(
    query: string,
    page: number,
    perPage: number,
    filters: ProductFilters = {},
  ): Promise<PaginatedProducts> {
    const supabase = await createServerClient();
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let q = supabase
      .from('products')
      .select(SELECT_COLS, { count: 'exact' })
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('is_visible', true)
      .is('deleted_at', null);

    if (filters.category) q = q.eq('category', filters.category);
    if (filters.inStock)  q = q.gt('stock_quantity', 0);
    if (filters.minPrice !== undefined) q = q.gte('price', filters.minPrice);
    if (filters.maxPrice !== undefined) q = q.lte('price', filters.maxPrice);

    const sort = filters.sort ?? 'newest';
    if (sort === 'price_asc')  q = q.order('price', { ascending: true });
    else if (sort === 'price_desc') q = q.order('price', { ascending: false });
    else q = q.order('created_at', { ascending: false });

    const { data, error, count } = await q.range(from, to);

    if (error) throw error;
    return { data: data ?? [], total: count ?? 0 };
  }

  /** Returns distinct category names for the filter dropdown */
  static async getCategories(): Promise<string[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_visible', true)
      .is('deleted_at', null)
      .not('category', 'is', null);

    if (error) throw error;
    const cats = [...new Set((data ?? []).map((r) => r.category as string))].sort();
    return cats;
  }
}
