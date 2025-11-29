"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Platform } from "@prisma/client";

const SORT_OPTIONS = [
  { value: 'new', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const PRICE_OPTIONS = [
  { value: 'all', label: 'All Games' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

const PLATFORM_OPTIONS = [
  { value: '', label: 'All Platforms' },
  { value: Platform.WINDOWS, label: 'Windows' },
  { value: Platform.MAC, label: 'Mac' },
  { value: Platform.LINUX, label: 'Linux' },
  { value: Platform.WEB, label: 'Web' },
  { value: Platform.ANDROID, label: 'Android' },
  { value: Platform.IOS, label: 'iOS' },
];

export function GameFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    params.set('page', '1'); // Reset to first page on filter change
    
    router.push(`/games?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Sort */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "rgba(200, 240, 200, 0.7)" }}
        >
          Sort By
        </label>
        <select
          value={searchParams.get('sort') || 'new'}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
          style={{ color: "rgba(200, 240, 200, 0.85)" }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Filter */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "rgba(200, 240, 200, 0.7)" }}
        >
          Price
        </label>
        <select
          value={searchParams.get('priceFilter') || 'all'}
          onChange={(e) => handleFilterChange('priceFilter', e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
          style={{ color: "rgba(200, 240, 200, 0.85)" }}
        >
          {PRICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Platform Filter */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "rgba(200, 240, 200, 0.7)" }}
        >
          Platform
        </label>
        <select
          value={searchParams.get('platform') || ''}
          onChange={(e) => handleFilterChange('platform', e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
          style={{ color: "rgba(200, 240, 200, 0.85)" }}
        >
          {PLATFORM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}



