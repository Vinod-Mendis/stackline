"use client";

import React from "react";
import { ScheduledProject } from "../../types";

interface LegendProps {
  projects: ScheduledProject[];
}

export function Legend({ projects }: LegendProps) {
  // Collect distinct phase names with their assigned colors
  const phaseMap = new Map<string, string>();

  for (const project of projects) {
    for (const phase of project.phases) {
      const name = phase.name.trim() || "Untitled phase";
      if (!phaseMap.has(name)) {
        phaseMap.set(name, phase.color);
      }
    }
  }

  const items = Array.from(phaseMap.entries());

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-0 px-3 py-2.5 border border-[var(--line)] bg-[var(--surface)] rounded-[6px] flex flex-wrap items-center gap-x-5 gap-y-2 select-none text-[12px]">
      <span className="text-[11px] font-medium text-[var(--muted)] shrink-0">
        Phases:
      </span>
      {items.map(([name, color]) => (
        <div key={name} className="flex items-center gap-1.5 shrink-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span className="text-[var(--ink)] font-normal">{name}</span>
        </div>
      ))}
    </div>
  );
}
