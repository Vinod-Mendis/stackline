"use client";

import React from "react";

export interface LegendItem {
  label: string;
  color: string;
}

interface LegendProps {
  title?: string;
  items: LegendItem[];
}

export function Legend({ title = "Phases", items }: LegendProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2 bg-[var(--surface-2)] flex flex-wrap items-center gap-x-5 gap-y-2 select-none text-[12px]">
      <span className="text-[11px] font-medium text-[var(--muted)] shrink-0">
        {title}
      </span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 shrink-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="text-[var(--ink)] font-normal">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
