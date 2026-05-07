'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity?: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dropdown' | 'buttons';
  showLabel?: boolean;
  label?: string;
}

export function QuantitySelector({
  quantity,
  maxQuantity = 999,
  onQuantityChange,
  disabled = false,
  size = 'md',
  variant = 'dropdown',
  showLabel = true,
  label = 'Qty:',
}: QuantitySelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customQuantity, setCustomQuantity] = useState('');

  const displayQuantity = quantity;

  const handleQuantityChange = (value: string) => {
    if (value === 'more' || value === 'custom') {
      setShowCustomInput(true);
      // Pre-fill custom input with current quantity
      setCustomQuantity(displayQuantity.toString());
    } else {
      const qty = parseInt(value);
      if (!isNaN(qty) && qty > 0 && qty <= maxQuantity) {
        onQuantityChange(qty);
        setShowCustomInput(false);
        setCustomQuantity('');
      }
    }
  };

  const handleCustomQuantitySubmit = () => {
    const qty = parseInt(customQuantity);
    if (!isNaN(qty) && qty > 0 && qty <= maxQuantity) {
      onQuantityChange(qty);
      setShowCustomInput(false);
      setCustomQuantity('');
    }
  };

  const handleCustomQuantityKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomQuantitySubmit();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          select: 'px-2 py-1.5 pr-8 text-xs',
          input: 'px-2 py-1.5 text-xs',
          button: 'px-2 py-1.5 text-xs',
          label: 'text-xs',
          chevron: 'w-3 h-3'
        };
      case 'lg':
        return {
          select: 'px-4 py-3 pr-12 text-base',
          input: 'px-4 py-3 text-base',
          button: 'px-4 py-3 text-base',
          label: 'text-base',
          chevron: 'w-5 h-5'
        };
      default:
        return {
          select: 'px-3 py-2.5 pr-10 text-sm',
          input: 'px-3 py-2.5 text-sm',
          button: 'px-3 py-2.5 text-sm',
          label: 'text-sm',
          chevron: 'w-4 h-4'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (variant === 'dropdown') {
    return (
      <div className="flex items-center gap-2">
        {showLabel && (
          <label className={`font-semibold text-neutral-700 ${sizeClasses.label}`}>
            {label}
          </label>
        )}
        {!showCustomInput ? (
          <div className="relative">
            <select
              value={displayQuantity <= 3 ? displayQuantity.toString() : 'custom'}
              onChange={(e) => handleQuantityChange(e.target.value)}
              disabled={disabled}
              className={`appearance-none border-2 border-neutral-300 rounded-xl font-semibold text-neutral-900 bg-white shadow-sm transition-all duration-200 ${
                disabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                  : 'cursor-pointer hover:border-brand-primary-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500'
              } ${sizeClasses.select}`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="1" className="bg-white text-center text-neutral-900 py-2 px-3 hover:bg-brand-primary-50 focus:bg-brand-primary-50">1</option>
              <option value="2" className="bg-white text-center text-neutral-900 py-2 px-3 hover:bg-brand-primary-50 focus:bg-brand-primary-50">2</option>
              <option value="3" className="bg-white text-center text-neutral-900 py-2 px-3 hover:bg-brand-primary-50 focus:bg-brand-primary-50">3</option>
              {displayQuantity > 3 && (
                <option value="custom" className="bg-white text-center text-brand-primary-600 font-medium py-2 px-3 hover:bg-brand-primary-50 focus:bg-brand-primary-50">
                  {displayQuantity}
                </option>
              )}
              <option value="more" className="bg-white text-center text-brand-primary-600 font-medium py-2 px-3 hover:bg-brand-primary-50 focus:bg-brand-primary-50">
                More...
              </option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customQuantity}
              onChange={(e) => setCustomQuantity(e.target.value)}
              onKeyPress={handleCustomQuantityKeyPress}
              placeholder="Enter quantity"
              min="1"
              max={maxQuantity}
              className={`border-2 border-neutral-300 rounded-xl font-semibold text-neutral-900 focus:outline-none focus:border-brand-primary-500 ${sizeClasses.input}`}
              autoFocus
            />
            <button
              onClick={handleCustomQuantitySubmit}
              className={`bg-brand-primary-600 text-white rounded-xl font-semibold hover:bg-brand-primary-700 transition ${sizeClasses.button}`}
            >
              Apply
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomQuantity('');
              }}
              className={`bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition ${sizeClasses.button}`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  // Button variant (for cart items)
  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <label className={`font-semibold text-neutral-700 ${sizeClasses.label}`}>
          {label}
        </label>
      )}
      <button
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        disabled={disabled || quantity <= 1}
        className={`border-2 border-neutral-300 rounded-xl font-semibold transition-all duration-200 ${
          disabled || quantity <= 1
            ? 'opacity-50 cursor-not-allowed bg-gray-50 text-neutral-400'
            : 'hover:border-brand-primary-400 hover:shadow-md text-neutral-700'
        } ${sizeClasses.button}`}
      >
        −
      </button>
      <span className={`font-semibold text-neutral-900 min-w-[3rem] text-center ${sizeClasses.label}`}>
        {quantity}
      </span>
      <button
        onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
        disabled={disabled || quantity >= maxQuantity}
        className={`border-2 border-neutral-300 rounded-xl font-semibold transition-all duration-200 ${
          disabled || quantity >= maxQuantity
            ? 'opacity-50 cursor-not-allowed bg-gray-50 text-neutral-400'
            : 'hover:border-brand-primary-400 hover:shadow-md text-neutral-700'
        } ${sizeClasses.button}`}
      >
        +
      </button>
    </div>
  );
}
