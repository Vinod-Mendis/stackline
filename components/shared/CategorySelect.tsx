"use client";

import React, { useState } from "react";
import { Category, PHASE_COLORS } from "../../types";

interface CategorySelectProps {
  id?: string;
  label: string;
  categories: Category[];
  selectedId: string | undefined;
  onChange: (id: string | undefined) => void;
  onAddCategory: (category: Category) => void;
  placeholder?: string;
  newOptionLabel?: string;
  allowNone?: boolean;
}

const NEW_CATEGORY_VALUE = "__NEW_CATEGORY__";

export function CategorySelect({
  id = "category-select",
  label,
  categories,
  selectedId,
  onChange,
  onAddCategory,
  placeholder = "None",
  newOptionLabel = "New type...",
  allowNone = true,
}: CategorySelectProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [colorIndex, setColorIndex] = useState(0);

  const selectedColor = PHASE_COLORS[colorIndex % PHASE_COLORS.length];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === NEW_CATEGORY_VALUE) {
      setIsCreating(true);
      setNewName("");
      // Pick next unused or arbitrary color
      setColorIndex((categories.length) % PHASE_COLORS.length);
    } else {
      setIsCreating(false);
      onChange(val === "" ? undefined : val);
    }
  };

  const handleCycleColor = () => {
    setColorIndex((prev) => (prev + 1) % PHASE_COLORS.length);
  };

  const handleSaveNew = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const newCategory: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      color: selectedColor,
    };

    onAddCategory(newCategory);
    onChange(newCategory.id);
    setIsCreating(false);
    setNewName("");
  };

  const handleCancelNew = () => {
    setIsCreating(false);
    setNewName("");
  };

  const selectedCategory = categories.find((c) => c.id === selectedId);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[12px] font-medium text-[var(--ink)]">
          {label}
        </label>
        {selectedCategory && !isCreating && (
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <span
              className="w-2 h-2 rounded-[2px]"
              style={{ backgroundColor: selectedCategory.color }}
              aria-hidden="true"
            />
            <span>{selectedCategory.name}</span>
          </div>
        )}
      </div>

      {!isCreating ? (
        <select
          id={id}
          value={selectedId ?? ""}
          onChange={handleSelectChange}
          className="h-9 px-3 text-[13px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[6px] text-[var(--ink)] focus:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
        >
          {allowNone && <option value="">{placeholder}</option>}
          {!allowNone && !selectedId && (
            <option value="" disabled>
              Select...
            </option>
          )}
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          <option value={NEW_CATEGORY_VALUE}>+ {newOptionLabel}</option>
        </select>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-[6px]">
          {/* Clickable color dot to cycle through palette */}
          <button
            type="button"
            onClick={handleCycleColor}
            className="w-5 h-5 rounded-[3px] border border-black/15 shadow-xs shrink-0 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-transform hover:scale-105"
            style={{ backgroundColor: selectedColor }}
            title="Click to change color"
            aria-label={`Selected color ${selectedColor}. Click to cycle color.`}
          />

          <input
            type="text"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveNew();
              } else if (e.key === "Escape") {
                e.preventDefault();
                handleCancelNew();
              }
            }}
            placeholder="Category name..."
            className="h-7 flex-1 min-w-0 px-2 text-[12px] bg-[var(--surface)] border border-[var(--line)] rounded-[4px] text-[var(--ink)] placeholder:text-[var(--muted)]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          />

          <button
            type="button"
            onClick={handleSaveNew}
            disabled={!newName.trim()}
            className="btn btn-primary"
          >
            Add
          </button>

          <button
            type="button"
            onClick={handleCancelNew}
            className="px-2 py-1 text-[11px] font-medium text-[var(--muted)] hover:text-[var(--ink)] rounded-[4px] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
