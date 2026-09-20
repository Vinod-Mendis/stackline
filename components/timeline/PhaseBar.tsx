"use client";

import React from "react";
import { ScheduledPhase } from "../../types";
import { formatDateRange, formatDuration } from "../../lib/dates";

interface PhaseBarProps {
  phase: ScheduledPhase;
  onClick: () => void;
}

export function PhaseBar({ phase, onClick }: PhaseBarProps) {
  const left = phase.dayOffset * 36;
  const width = Math.max(phase.durationDays * 36 - 3, 24);
  const durationLabel = formatDuration(phase.amount, phase.unit);
  const dateRangeLabel = formatDateRange(phase.startDate, phase.endDate);
  const tooltipText = `${phase.name} (${durationLabel}) • ${dateRangeLabel}`;

  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltipText}
      aria-label={`Edit phase: ${phase.name}, duration ${durationLabel}, from ${phase.startDate} to ${phase.endDate}`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        backgroundColor: phase.color,
      }}
      className="absolute top-[14px] h-[38px] rounded-[5px] text-white px-2 py-0.5 text-left flex flex-col justify-center cursor-pointer select-none overflow-hidden transition-[filter] hover:brightness-108 active:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
    >
      <span className="text-[12px] font-medium leading-tight truncate text-white">
        {phase.name}
      </span>
      <span className="text-[10px] leading-tight text-white/85 tabular-nums truncate">
        {durationLabel}
      </span>
    </button>
  );
}
