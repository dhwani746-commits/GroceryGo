import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, original_price, discount_percentage, stock_quantity, category, is_visible, image_urls, created_at, deleted_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    
    // Auto-create category if it does not exist in categories table
    if (body.category && typeof body.category === 'string') {
      const catName = body.category.trim();
      const slug = catName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      await supabase
        .from('categories')
        .upsert({ name: catName, slug }, { onConflict: 'name', ignoreDuplicates: true });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: parseFloat(body.price),
        original_price: body.original_price ? parseFloat(body.original_price) : null,
        stock_quantity: parseInt(body.stock_quantity),
        category: body.category?.trim(),
        image_urls: body.image_urls || [],
        is_visible: body.is_visible !== false,
      }])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
