"use client";

import React, { useState } from "react";

interface NumberStepperProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}

export function NumberStepper({
  id,
  value,
  onChange,
  min = 1,
  max = 999,
  ariaLabel,
}: NumberStepperProps) {
  // While typing, keep the raw text so the field can be briefly empty
  const [draft, setDraft] = useState<string | null>(null);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const step = (delta: number) => {
    setDraft(null);
    onChange(clamp(value + delta));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, String(max).length);
    setDraft(digits);
    if (digits !== "") onChange(clamp(parseInt(digits, 10)));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      step(-1);
    }
  };

  const buttonClass =
    "w-6 h-full shrink-0 flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--muted)] disabled:cursor-not-allowed cursor-pointer transition-colors";

  return (
    <div className="field field-sm flex items-stretch !p-0 overflow-hidden focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_2px_var(--ring)]">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => step(-1)}
        className={buttonClass}
      >
        <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M3.5 8h9" />
        </svg>
      </button>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        role="spinbutton"
        aria-label={ariaLabel}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        value={draft ?? String(value)}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
        onKeyDown={handleKeyDown}
        className="w-full min-w-0 bg-transparent text-center text-[13px] tabular-nums text-[var(--ink)] outline-none"
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => step(1)}
        className={buttonClass}
      >
        <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M3.5 8h9M8 3.5v9" />
        </svg>
      </button>
    </div>
  );
}
