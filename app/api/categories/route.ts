import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProductRepository } from '@/lib/repositories/product.repository';

export async function GET() {
  try {
    const categories = await ProductRepository.getCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: trimmedName,
        slug,
        product_count: 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
