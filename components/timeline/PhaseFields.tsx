"use client";

import React from "react";
import { Phase, PHASE_COLORS, PhaseUnit } from "../../types";

interface PhaseFieldsProps {
  phase: Phase;
  index: number;
  totalPhases: number;
  onChange: (updated: Phase) => void;
  onRemove: () => void;
}

export function PhaseFields({
  phase,
  index,
  totalPhases,
  onChange,
  onRemove,
}: PhaseFieldsProps) {
  const cycleColor = () => {
    const currentIndex = PHASE_COLORS.indexOf(phase.color);
    const nextIndex = (currentIndex + 1) % PHASE_COLORS.length;
    onChange({ ...phase, color: PHASE_COLORS[nextIndex] });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...phase, name: e.target.value });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const amount = Number.isNaN(val) ? 1 : Math.max(1, val);
    onChange({ ...phase, amount });
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...phase, unit: e.target.value as PhaseUnit });
  };

  const phaseId = phase.id;

  return (
    <div className="flex items-center gap-2 py-1.5 group">
      {/* Color cycling dot */}
      <button
        type="button"
        onClick={cycleColor}
        className="w-5 h-5 rounded-full shrink-0 border border-black/10 transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
        style={{ backgroundColor: phase.color }}
        title="Click to cycle color"
        aria-label={`Cycle color for phase ${index + 1}. Current color: ${phase.color}`}
      />

      {/* Phase Name */}
      <div className="flex-1 min-w-0">
        <label htmlFor={`phase-name-${phaseId}`} className="sr-only">
          Phase {index + 1} name
        </label>
        <input
          id={`phase-name-${phaseId}`}
          type="text"
          value={phase.name}
          onChange={handleNameChange}
          placeholder="Phase name, e.g. Research"
          className="w-full h-8 px-2.5 text-[13px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[5px] text-[var(--ink)] placeholder:text-[var(--muted)]/70 focus:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
        />
      </div>

      {/* Amount Number */}
      <div className="w-16 shrink-0">
        <label htmlFor={`phase-amount-${phaseId}`} className="sr-only">
          Phase {index + 1} duration amount
        </label>
        <input
          id={`phase-amount-${phaseId}`}
          type="number"
          min="1"
          step="1"
          value={phase.amount}
          onChange={handleAmountChange}
          className="w-full h-8 px-2 text-[13px] text-center tabular-nums bg-[var(--surface-2)] border border-[var(--line)] rounded-[5px] text-[var(--ink)] focus:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
        />
      </div>

      {/* Unit Select */}
      <div className="w-22 shrink-0">
        <label htmlFor={`phase-unit-${phaseId}`} className="sr-only">
          Phase {index + 1} duration unit
        </label>
        <select
          id={`phase-unit-${phaseId}`}
          value={phase.unit}
          onChange={handleUnitChange}
          className="w-full h-8 px-2 text-[13px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[5px] text-[var(--ink)] focus:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] cursor-pointer"
        >
          <option value="days">days</option>
          <option value="weeks">weeks</option>
        </select>
      </div>

      {/* Remove Phase Button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={totalPhases <= 1}
        className={`w-8 h-8 rounded-[5px] shrink-0 flex items-center justify-center text-[15px] border border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
          totalPhases <= 1
            ? "text-[var(--muted)]/40 cursor-not-allowed"
            : "text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line)] hover:bg-[var(--surface-2)] cursor-pointer"
        }`}
        aria-label={`Remove phase ${index + 1}`}
        title={totalPhases <= 1 ? "Project must have at least one phase" : "Remove phase"}
      >
        ✕
      </button>
    </div>
  );
}
