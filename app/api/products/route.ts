import { NextResponse } from 'next/server';
import { ProductRepository, SortOption } from '@/lib/repositories/product.repository';

const DEFAULT_PER_PAGE = 12;
const MAX_PER_PAGE = 48;
const VALID_SORTS: SortOption[] = ['newest', 'price_asc', 'price_desc'];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query    = searchParams.get('q') ?? '';
    const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const perPage  = Math.min(MAX_PER_PAGE, Math.max(1, parseInt(searchParams.get('per_page') ?? String(DEFAULT_PER_PAGE), 10)));
    const rawSort  = searchParams.get('sort') ?? 'newest';
    const sort: SortOption = VALID_SORTS.includes(rawSort as SortOption) ? (rawSort as SortOption) : 'newest';
    const category = searchParams.get('category') ?? '';
    const inStock  = searchParams.get('in_stock') === '1';
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;

    const paginate = searchParams.has('page') || searchParams.has('per_page');
    const filters  = { sort, category: category || undefined, inStock: inStock || undefined, minPrice, maxPrice };

    if (paginate) {
      const result = query.trim()
        ? await ProductRepository.searchProductsPaginated(query.trim(), page, perPage, filters)
        : await ProductRepository.getProductsPaginated(page, perPage, filters);

      const totalPages = Math.ceil(result.total / perPage);

      return NextResponse.json({
        success: true,
        data: result.data,
        meta: { page, perPage, total: result.total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
      });
    }

    // Legacy non-paginated (homepage ProductSegments)
    const products = query.trim()
      ? await ProductRepository.searchProducts(query.trim())
      : await ProductRepository.getAllProducts();

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
