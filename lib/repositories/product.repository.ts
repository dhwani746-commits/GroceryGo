import { createClient as createServerClient } from '@/lib/supabase/server';
import { Product } from '@/lib/store/products';

export class ProductRepository {
  static async getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, description, image_urls, stock_quantity, category')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async getAllProducts(): Promise<Product[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, description, image_urls, stock_quantity, category')
      .eq('is_visible', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (error) throw error;
    return data || [];
  }

  static async searchProducts(query: string): Promise<Product[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, description, image_urls, stock_quantity, category')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_visible', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
