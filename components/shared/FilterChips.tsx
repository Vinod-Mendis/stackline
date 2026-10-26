"use client";

import React from "react";
import { Category } from "../../types";

interface FilterChipsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  allLabel?: string;
}

export function FilterChips({
  categories,
  selectedCategoryId,
  onSelectCategory,
  allLabel = "All",
}: FilterChipsProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap select-none text-[12px]">
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className="chip"
        aria-pressed={selectedCategoryId === null}
      >
        {allLabel}
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className="chip"
            aria-pressed={isSelected}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
              aria-hidden="true"
            />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
