"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');

  const debouncedSearch = useDebouncedCallback((searchValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchValue) {
      params.set('q', searchValue);
    } else {
      params.delete('q');
    }
    
    params.set('page', '1'); // Reset to first page on search
    
    router.push(`/games?${params.toString()}`);
  }, 300);

  useEffect(() => {
    setValue(searchParams.get('q') || '');
  }, [searchParams]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSearch(e.target.value);
        }}
        placeholder="Search games..."
        className="w-full px-4 py-3 pl-11 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
        style={{ color: "rgba(200, 240, 200, 0.85)" }}
        aria-label="Search games"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: "rgba(200, 240, 200, 0.5)" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}



