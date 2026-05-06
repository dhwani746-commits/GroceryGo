'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { ProductGallery } from '@/components/store/ProductGallery';
import { RelatedProducts } from '@/components/store/RelatedProducts';
import { getProductDiscount } from '@/lib/utils/discounts';
import { useCart, CartItem } from '@/lib/store/cart';
import { useQuery } from '@tanstack/react-query';
import { getProductBySlug } from '@/lib/api/products';
import { Product } from '@/lib/store/products';
import { ShoppingCart, Minus, Plus, Check, ArrowLeft } from 'lucide-react';

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

  const cartItem: CartItem | undefined = product ? items.find((i) => i.id === product.id) : undefined;
  const isInCart = !!cartItem;
  const displayQuantity = cartItem?.quantity ?? quantity;

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const inStock = product.stock_quantity > 0;
  
  // Calculate discount for this product
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

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-24 md:pb-8">
        {/* Mobile Back Button */}
        <button
          onClick={() => window.history.back()}
          className="md:hidden flex items-center gap-2 text-neutral-600 mb-4 -ml-1"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Breadcrumb - Hidden on mobile, shown on md+ */}
        <div className="hidden md:block mb-6">
          <Breadcrumb
            items={[
              ...(product.category ? [{ label: product.category, href: `/search?q=${encodeURIComponent(product.category)}` }] : []),
              { label: product.name },
            ]}
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Gallery */}
          <div className="order-1">
            <ProductGallery images={product.image_urls} productName={product.name} />
          </div>

          {/* Details */}
          <div className="order-2 space-y-4 md:space-y-6">
            {/* Product Name */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
                {product.name}
              </h1>
              
              {/* Mobile Category Tag */}
              {product.category && (
                <span className="inline-block md:hidden mt-2 text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                  {product.category}
                </span>
              )}
            </div>
            
            {/* Price Section with Discount */}
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

            {/* Quantity Selector - Desktop Only */}
            {inStock && (
              <div className="hidden md:flex items-center gap-4">
                <label className="font-semibold text-neutral-700">Quantity:</label>
                <div className="flex items-center border-2 border-neutral-300 rounded-lg overflow-hidden">
                  <button
                    onClick={handleDecreaseQty}
                    className="px-4 py-2 hover:bg-neutral-100 text-neutral-700 transition active:bg-neutral-200"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-4 py-2 border-x-2 border-neutral-300 text-neutral-900 font-semibold min-w-[3rem] text-center">
                    {displayQuantity}
                  </span>
                  <button
                    onClick={handleIncreaseQty}
                    className="px-4 py-2 hover:bg-neutral-100 text-neutral-700 transition active:bg-neutral-200"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button - Desktop */}
            {inStock && (
              <div className="hidden md:block">
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={`w-full py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    isInCart
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-brand-primary-600 text-white hover:bg-brand-primary-700 active:bg-brand-primary-800'
                  }`}
                >
                  {isInCart ? (
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
            )}
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
      {inStock && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3 z-50">
          <div className="flex items-center gap-4 max-w-md mx-auto">
            {/* Quantity Selector */}
            <div className="flex items-center border-2 border-neutral-300 rounded-lg overflow-hidden flex-shrink-0">
              <button
                onClick={handleDecreaseQty}
                className="px-3 py-2.5 hover:bg-neutral-100 text-neutral-700 active:bg-neutral-200"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="px-3 py-2.5 border-x-2 border-neutral-300 text-neutral-900 font-semibold min-w-[2.5rem] text-center text-sm">
                {displayQuantity}
              </span>
              <button
                onClick={handleIncreaseQty}
                className="px-3 py-2.5 hover:bg-neutral-100 text-neutral-700 active:bg-neutral-200"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                isInCart
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-brand-primary-600 text-white active:bg-brand-primary-700'
              }`}
            >
              {isInCart ? (
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
      )}
    </div>
  );
}
