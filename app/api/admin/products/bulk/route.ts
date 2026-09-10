import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Helper to check for admin access
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role?.toUpperCase() === 'ADMIN' ? user : null;
}

// Generate a valid slug from a product name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

interface ProductInput {
  name: string;
  price: number;
  original_price?: number | null;
  stock_quantity?: number;
  category: string;
  description?: string;
  image_urls?: string[];
  is_visible?: boolean;
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const products: ProductInput[] = body.products || [];

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: products list is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Extract all unique category names and ensure they exist in 'categories' table
    const uniqueCategories = Array.from(
      new Set(products.map((p) => p.category?.trim()).filter(Boolean))
    );

    if (uniqueCategories.length > 0) {
      const categoryPayload = uniqueCategories.map((catName) => ({
        name: catName,
        slug: generateSlug(catName),
      }));

      const { error: catError } = await supabase
        .from('categories')
        .upsert(categoryPayload, { onConflict: 'name', ignoreDuplicates: true });

      if (catError) {
        console.error('Auto-category upsert warning:', catError);
      }
    }

    // 2. Gather all unique base slugs from input names
    const baseSlugs = products.map((p) => generateSlug(p.name));
    
    // 3. Fetch existing matching slugs to check conflicts
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('slug')
      .in('slug', baseSlugs);

    if (fetchError) throw fetchError;
    
    const existingSlugsSet = new Set((existingProducts || []).map((p) => p.slug));

    // Helper to generate a unique slug on conflict
    const getUniqueSlug = (name: string, assignedSlugs: Set<string>): string => {
      const base = generateSlug(name);
      let unique = base;
      let counter = 1;
      while (existingSlugsSet.has(unique) || assignedSlugs.has(unique)) {
        unique = `${base}-${counter}`;
        counter++;
      }
      return unique;
    };

    const assignedSlugs = new Set<string>();
    const importPayload = products.map((p) => {
      const slug = getUniqueSlug(p.name, assignedSlugs);
      assignedSlugs.add(slug);

      return {
        name: p.name.trim(),
        slug,
        description: p.description?.trim() || '',
        price: p.price,
        original_price: p.original_price || null,
        stock_quantity: Math.max(0, p.stock_quantity ?? 0),
        category: p.category.trim(),
        image_urls: p.image_urls || [],
        is_visible: p.is_visible !== false,
      };
    });

    // 4. Batch insert products into Supabase
    const { data, error } = await supabase
      .from('products')
      .insert(importPayload)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${data.length} products`,
      count: data.length,
    });
  } catch (error) {
    console.error('POST /api/admin/products/bulk error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
