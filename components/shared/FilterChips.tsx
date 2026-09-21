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
        className={`px-2.5 py-1 rounded-[6px] border transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
          selectedCategoryId === null
            ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)] font-medium"
            : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
        }`}
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
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
              isSelected
                ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)] font-medium"
                : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            }`}
          >
            <span
              className="w-2 h-2 rounded-[2px] shrink-0"
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
