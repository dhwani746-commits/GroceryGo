'use client';

import { useState, useEffect } from 'react';

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  onApply: (min: number, max: number) => void;
  currentMin?: number;
  currentMax?: number;
}

/**
 * Price range slider component for search filters
 * Simple dual-input approach: two range inputs with synchronized logic
 */
export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onApply,
  currentMin,
  currentMax,
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState(currentMin ?? minPrice);
  const [localMax, setLocalMax] = useState(currentMax ?? maxPrice);

  // Sync local state when props change (external reset)
  useEffect(() => {
    setLocalMin(currentMin ?? minPrice);
    setLocalMax(currentMax ?? maxPrice);
  }, [currentMin, currentMax, minPrice, maxPrice]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || 0;
    const minValue = Math.max(100, minPrice);
    const maxValue = Math.max(localMax - 100, minValue + 100);
    const clampedValue = Math.min(Math.max(value, minValue), maxValue);
    setLocalMin(clampedValue);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || 0;
    const minValue = Math.max(localMin + 100, 100);
    const clampedValue = Math.max(value, minValue);
    setLocalMax(clampedValue);
  };

  const handleApply = () => {
    onApply(localMin, localMax);
  };

  const handleReset = () => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
    onApply(minPrice, maxPrice);
  };

  return (
    <div className="space-y-4">
      {/* Price Input Fields */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-neutral-500 font-medium block mb-1">Min Price</label>
          <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
            <span className="px-2 text-neutral-500 text-sm">$</span>
            <input
              type="number"
              value={localMin}
              onChange={handleMinInputChange}
              className="flex-1 px-2 py-2 text-sm border-0 outline-none bg-transparent"
              min={Math.max(100, minPrice)}
              max={localMax - 100}
              placeholder={Math.max(100, minPrice).toString()}
            />
          </div>
        </div>

        <div className="pb-2">−</div>

        <div className="flex-1">
          <label className="text-xs text-neutral-500 font-medium block mb-1">Max Price</label>
          <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
            <span className="px-2 text-neutral-500 text-sm">$</span>
            <input
              type="number"
              value={localMax}
              onChange={handleMaxInputChange}
              className="flex-1 px-2 py-2 text-sm border-0 outline-none bg-transparent"
              min={Math.max(localMin + 100, 100)}
              max={maxPrice}
              placeholder={maxPrice.toString()}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleApply}
          className="flex-1 px-3 py-2 text-sm font-medium bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-700 transition"
        >
          Apply
        </button>
        <button
          onClick={handleReset}
          className="flex-1 px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
