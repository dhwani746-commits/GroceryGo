'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { QuantitySelector } from '@/components/shared/QuantitySelector';

interface CartItemProps {
  item: {
    product: {
      id: string;
      name: string;
      price: number;
      images: string[];
      slug: string;
      stockCount: number;
    };
    quantity: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item;
  const subtotal = product.price * quantity;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover rounded-md"
              sizes="80px"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatCurrency(product.price)} each
                </p>
                {product.stockCount <= 5 && (
                  <p className="text-sm text-orange-600 mt-1">
                    Only {product.stockCount} left in stock
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(product.id)}
                className="text-gray-400 hover:text-red-600 ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between">
              <QuantitySelector
                quantity={quantity}
                maxQuantity={product.stockCount}
                onQuantityChange={(newQuantity) => onUpdateQuantity(product.id, newQuantity)}
                size="sm"
                variant="buttons"
                showLabel={false}
              />
              <div className="font-semibold text-gray-900">
                {formatCurrency(subtotal)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
