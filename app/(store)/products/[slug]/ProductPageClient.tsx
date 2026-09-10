'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ProductGallery } from '@/components/store/ProductGallery';
import { RelatedProducts } from '@/components/store/RelatedProducts';
import { QuantitySelector } from '@/components/shared/QuantitySelector';
import { getProductDiscount } from '@/lib/utils/discounts';
import { useCart, CartItem } from '@/lib/store/cart';
import { useQuery } from '@tanstack/react-query';
import { getProductBySlug } from '@/lib/api/products';
import { ShoppingCart, Check } from 'lucide-react';

export default function ProductPageClient() {
  const params = useParams();
  const slug = params.slug as string;
  const [quantity, setQuantity] = useState(1);
  const { addItem, items, updateQuantity } = useCart();

  const { data: product, isLoading: loading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });

  const cartItem: CartItem | undefined = product ? items.find((i) => i.id === product.id) : undefined;
  const isInCart = !!cartItem;
  const displayQuantity = cartItem?.quantity ?? quantity;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header hideSearch />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-24 md:pb-8">
          <div className="mb-4 md:mb-6">
            <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
            <div className="order-1">
              <ProductGallery images={null} productName="" isLoading={true} />
            </div>

            <div className="order-2 space-y-4 md:space-y-6">
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
              
              <div className="flex items-baseline gap-3">
                <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-7 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
              
              <div className="bg-neutral-50 rounded-lg p-4 md:p-6 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-12 bg-gray-200 rounded flex-1 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) return <div className="text-center py-20">Product not found</div>;

  const inStock = product.stock_quantity > 0;
  
  const priceInCents = Math.round(Number(product.price) * 100);
  const discount = getProductDiscount({
    price: Number(product.price),
    original_price: product.original_price,
    discount_percentage: product.discount_percentage,
  });
  const originalPrice = discount?.originalPrice ?? priceInCents;
  const savingsInCents = discount?.savingsInCents ?? 0;
  const discountPercent = discount?.discountPercent ?? 0;

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
      setQuantity(1);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    if (isInCart && cartItem) {
      const finalQty = newQuantity <= product.stock_quantity ? newQuantity : cartItem.quantity;
      updateQuantity(product.id, finalQty);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header hideSearch />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-24 md:pb-8">

        {/* Breadcrumb */}
        <div className="mb-4 md:mb-6">
          <Breadcrumb
            items={[
              ...(product.category ? [{ label: product.category, href: `/search?q=${encodeURIComponent(product.category)}` }] : []),
              { label: product.name },
            ]}
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
          {/* Gallery */}
          <div className="order-1">
            <ProductGallery images={product.image_urls} productName={product.name} isLoading={loading} />
          </div>

          {/* Details */}
          <div className="order-2 space-y-4 md:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
                {product.name}
              </h1>
              
              {product.category && (
                <span className="inline-block md:hidden mt-2 text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                  {product.category}
                </span>
              )}
            </div>
            
            {/* Price Section */}
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <p className="text-2xl sm:text-3xl font-bold text-brand-primary-600">
                ₹{(Number(product.price)).toFixed(0)}
              </p>
              {discount && (
                <>
                  <p className="text-lg sm:text-xl text-neutral-400 line-through">
                    ₹{(originalPrice / 100).toFixed(0)}
                  </p>
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs sm:text-sm font-bold">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            
            {savingsInCents > 0 && (
              <p className="text-green-600 font-semibold text-sm sm:text-base">
                You save ₹{(savingsInCents / 100).toFixed(0)}
              </p>
            )}

            {/* Description */}
            <div className="bg-neutral-50 rounded-lg p-4 md:p-6">
              <h2 className="text-sm font-semibold mb-2 text-neutral-500 uppercase tracking-wide">
                Description
              </h2>
              <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
                {product.description || 'No description available'}
              </p>
            </div>

            {/* Stock Status */}
            {product.stock_quantity === 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <p className="text-red-700 font-semibold text-sm">Out of Stock</p>
              </div>
            )}
            {product.stock_quantity > 0 && product.stock_quantity <= 3 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <p className="text-orange-700 font-semibold text-sm">
                  Only {product.stock_quantity} left in stock
                </p>
              </div>
            )}
            {product.stock_quantity > 3 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <p className="text-green-700 font-medium text-sm">In Stock</p>
              </div>
            )}

            {/* Quantity Selector - Desktop */}
            <div className="hidden md:block">
              <QuantitySelector
                quantity={quantity}
                maxQuantity={product.stock_quantity}
                onQuantityChange={handleQuantityChange}
                disabled={!inStock}
                size="md"
                variant="dropdown"
              />
            </div>

            {/* Add to Cart Button - Desktop */}
            <div className="hidden md:block">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || isInCart}
                className={`w-full py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  !inStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isInCart
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-brand-primary-600 text-white hover:bg-brand-primary-700 active:bg-brand-primary-800'
                }`}
              >
                {!inStock ? (
                  <>
                    <ShoppingCart size={20} />
                    Out of Stock
                  </>
                ) : isInCart ? (
                  <>
                    <Check size={20} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8 md:mt-12">
          <RelatedProducts 
            productId={product.id} 
            category={product.category}
            price={Number(product.price)}
          />
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3 z-40">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex-shrink-0">
            <QuantitySelector
              quantity={quantity}
              maxQuantity={product.stock_quantity}
              onQuantityChange={handleQuantityChange}
              disabled={!inStock}
              size="sm"
              variant="dropdown"
              showLabel={true}
              label="Qty:"
            />
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock || isInCart}
            className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
              !inStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isInCart
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-brand-primary-600 text-white active:bg-brand-primary-700'
            }`}
          >
            {!inStock ? (
              <>
                <ShoppingCart size={18} />
                Out of Stock
              </>
            ) : isInCart ? (
              <>
                <Check size={18} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                Add ₹{(Number(product.price) * displayQuantity).toFixed(0)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
