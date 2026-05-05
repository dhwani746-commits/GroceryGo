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

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), localMax - 100);
    setLocalMin(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), localMin + 100);
    setLocalMax(value);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value) || minPrice, localMax - 100);
    setLocalMin(value);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value) || maxPrice, localMin + 100);
    setLocalMax(value);
  };

  const handleApply = () => {
    onApply(localMin, localMax);
  };

  const handleReset = () => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
    onApply(minPrice, maxPrice);
  };

  const percentMin = ((localMin - minPrice) / (maxPrice - minPrice)) * 100;
  const percentMax = ((localMax - minPrice) / (maxPrice - minPrice)) * 100;

  return (
    <div className="space-y-4">
      {/* Range Slider with Track */}
      <div className="space-y-2">
        <div className="relative h-8 flex items-center">
          {/* Background track */}
          <div className="absolute w-full h-1 bg-neutral-200 rounded-full pointer-events-none" />

          {/* Filled track (between min and max) */}
          <div
            className="absolute h-1 bg-brand-primary-600 rounded-full pointer-events-none"
            style={{
              left: `${percentMin}%`,
              right: `${100 - percentMax}%`,
            }}
          />

          {/* Min slider - must come after max so it appears on top when overlapping */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={localMin}
            onChange={handleMinChange}
            className="absolute w-full h-1 appearance-none bg-transparent rounded-lg cursor-pointer range-input"
            style={{ zIndex: localMin > maxPrice - (maxPrice - minPrice) / 2 ? 5 : 3 }}
          />

          {/* Max slider */}
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={localMax}
            onChange={handleMaxChange}
            className="absolute w-full h-1 appearance-none bg-transparent rounded-lg cursor-pointer range-input"
            style={{ zIndex: 4 }}
          />
        </div>

        {/* Display current range */}
        <div className="flex justify-between text-xs text-neutral-600 px-1">
          <span>₹{localMin}</span>
          <span>₹{localMax}</span>
        </div>
      </div>

      {/* Price Input Fields */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-neutral-500 font-medium block mb-1">Min Price</label>
          <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
            <span className="px-2 text-neutral-500 text-sm">₹</span>
            <input
              type="number"
              value={localMin}
              onChange={handleMinInputChange}
              className="flex-1 px-2 py-2 text-sm border-0 outline-none bg-transparent"
              min={minPrice}
              max={localMax - 100}
            />
          </div>
        </div>

        <div className="pb-2">−</div>

        <div className="flex-1">
          <label className="text-xs text-neutral-500 font-medium block mb-1">Max Price</label>
          <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
            <span className="px-2 text-neutral-500 text-sm">₹</span>
            <input
              type="number"
              value={localMax}
              onChange={handleMaxInputChange}
              className="flex-1 px-2 py-2 text-sm border-0 outline-none bg-transparent"
              min={localMin + 100}
              max={maxPrice}
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

      <style jsx>{`
        .range-input {
          -webkit-appearance: none;
          width: 100%;
        }

        .range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #2563eb;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .range-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #2563eb;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .range-input::-webkit-slider-runnable-track {
          background: transparent;
          border: none;
        }

        .range-input::-moz-range-track {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}
