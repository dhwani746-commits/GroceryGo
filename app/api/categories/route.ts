import { NextResponse } from 'next/server';
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
