'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { ProductGallery } from '@/components/store/ProductGallery';
import { RelatedProducts } from '@/components/store/RelatedProducts';

import { useCart } from '@/lib/store/cart';

import { useQuery } from '@tanstack/react-query';
import { getProductBySlug } from '@/lib/api/products';
import { Product } from '@/lib/store/products';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [quantity, setQuantity] = useState(1);
  const { addItem, items, updateQuantity } = useCart();

  const { data: product, isLoading: loading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });

  const cartItem = product ? items.find((i) => i.id === product.id) : null;
  const isInCart = !!cartItem;

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const inStock = product.stock_quantity > 0;

  const handleAddToCart = () => {
    if (quantity > 0 && inStock) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        slug: product.slug,
        image: product.image_urls?.[0],
      });
      setQuantity(1); // Reset local quantity after adding
    }
  };

  const handleDecreaseQty = () => {
    if (isInCart && cartItem) {
      const newQty = cartItem.quantity > 1 ? cartItem.quantity - 1 : 1;
      updateQuantity(product.id, newQty);
    } else {
      setQuantity((q) => (q > 1 ? q - 1 : 1));
    }
  };

  const handleIncreaseQty = () => {
    if (isInCart && cartItem) {
      const newQty = cartItem.quantity < product.stock_quantity ? cartItem.quantity + 1 : cartItem.quantity;
      updateQuantity(product.id, newQty);
    } else {
      setQuantity((q) => (q < product.stock_quantity ? q + 1 : q));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full mt-32">
        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-6">
          ← Back to Products
        </Link>
        <br /> <br />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Gallery */}
          <ProductGallery images={product.image_urls} productName={product.name} />

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-2xl font-bold text-blue-600 mt-2">₹{(Number(product.price)).toFixed(2)}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-400">Description</h2>
              <p className="text-gray-800 font-medium">{product.description || 'No description available'}</p>
            </div>

            {product.stock_quantity === 0 && (
              <div className="p-3 bg-red-100 border border-red-300 rounded">
                <p className="text-red-700 font-semibold">Out of Stock</p>
              </div>
            )}
            {product.stock_quantity > 0 && product.stock_quantity <= 3 && (
              <div className="p-3 bg-orange-100 border border-orange-300 rounded">
                <p className="text-orange-700 font-semibold">Only {product.stock_quantity} item{product.stock_quantity > 1 ? 's' : ''} left</p>
              </div>
            )}

            {inStock && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-bold text-gray-900">Quantity:</label>
                  <div className="flex items-center border-2 border-gray-800 rounded">
                    <button
                      onClick={handleDecreaseQty}
                      className="px-3 py-2 hover:bg-gray-100 text-gray-900 font-bold text-lg"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 border-l-2 border-r-2 border-gray-800 text-gray-900 font-bold text-lg">{cartItem?.quantity || quantity}</span>
                    <button
                      onClick={handleIncreaseQty}
                      className="px-3 py-2 hover:bg-gray-100 text-gray-900 font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={`w-full py-3 rounded-lg font-semibold transition ${isInCart
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {isInCart ? '✓ In Cart' : 'Add to Cart'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts productId={product.id} category={product.category} />
      </main>
    </div>
  );
}
