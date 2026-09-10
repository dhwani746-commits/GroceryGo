import type { Metadata } from 'next';
import { ProductRepository } from '@/lib/repositories/product.repository';
import ProductPageClient from './ProductPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await ProductRepository.getProductBySlug(slug);

    if (!product) {
      return {
        title: 'Product Not Found — GroceryGo',
        description: 'The requested grocery product could not be found on GroceryGo.',
      };
    }

    const priceFormatted = (Number(product.price)).toFixed(0);
    const categoryPrefix = product.category ? `${product.category} • ` : '';

    return {
      title: `${product.name} (₹${priceFormatted}) — GroceryGo`,
      description: product.description 
        ? `${product.description.slice(0, 150)}... Buy ${product.name} fresh online on GroceryGo.` 
        : `${categoryPrefix}Buy ${product.name} fresh online at ₹${priceFormatted} with fast delivery on GroceryGo.`,
      openGraph: {
        title: `${product.name} — GroceryGo`,
        description: product.description || `Buy ${product.name} fresh online at GroceryGo.`,
        images: product.image_urls && product.image_urls.length > 0 ? [{ url: product.image_urls[0] }] : [],
      },
    };
  } catch {
    return {
      title: 'Product Details — GroceryGo',
      description: 'Shop fresh groceries & daily essentials online at GroceryGo.',
    };
  }
}

export default function ProductPage() {
  return <ProductPageClient />;
}
