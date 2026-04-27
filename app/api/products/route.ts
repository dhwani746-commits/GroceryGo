import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    const products = query 
      ? await ProductService.searchProducts(query)
      : await ProductService.getAllProducts();
      
    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
