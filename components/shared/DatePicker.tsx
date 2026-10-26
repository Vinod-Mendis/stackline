"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  addDaysUTC,
  formatDateUTC,
  getMondayOfWeekUTC,
  getTodayDateString,
  isValidDateString,
  parseDateUTC,
} from "../../lib/dates";

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  ariaLabel?: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const POPUP_WIDTH = 264;
const POPUP_HEIGHT = 322;

function formatDisplay(value: string): string {
  if (!isValidDateString(value)) return "";
  const d = parseDateUTC(value);
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** First day of the month containing `dateStr`, shifted by `delta` months. */
function shiftMonth(dateStr: string, delta: number): string {
  const d = parseDateUTC(dateStr);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 1));
  // Keep the same day of month where possible (clamped to the month's length)
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)
  ).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), lastDay));
  return formatDateUTC(target);
}

export function DatePicker({
  id,
  value,
  onChange,
  invalid = false,
  ariaLabel,
}: DatePickerProps) {
  const dialogId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  // The day that has keyboard focus inside the grid; also decides the shown month
  const [activeDate, setActiveDate] = useState(value);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  const today = getTodayDateString();

  const open = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const below = window.innerHeight - rect.bottom;
    const openUp = below < POPUP_HEIGHT && rect.top > below;
    const desiredTop = openUp ? rect.top - POPUP_HEIGHT - 4 : rect.bottom + 4;
    // Stay inside the viewport even when neither side has full room
    const top = Math.max(8, Math.min(desiredTop, window.innerHeight - POPUP_HEIGHT - 8));
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPUP_WIDTH - 8));
    setPos({ left, top });
    setActiveDate(isValidDateString(value) ? value : today);
    setIsOpen(true);
  };

  const close = useCallback((refocus = true) => {
    setIsOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const select = (date: string) => {
    onChange(date);
    close();
  };

  // Close on outside click, scroll or resize
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (popupRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      close(false);
    };
    const onViewportChange = (e: Event) => {
      if (popupRef.current?.contains(e.target as Node)) return;
      close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [isOpen, close]);

  // Move focus to the active day whenever it changes while open
  useEffect(() => {
    if (!isOpen) return;
    popupRef.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${activeDate}"]`)
      ?.focus();
  }, [isOpen, activeDate]);

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDaysUTC(activeDate, -1),
      ArrowRight: () => addDaysUTC(activeDate, 1),
      ArrowUp: () => addDaysUTC(activeDate, -7),
      ArrowDown: () => addDaysUTC(activeDate, 7),
      PageUp: () => shiftMonth(activeDate, -1),
      PageDown: () => shiftMonth(activeDate, 1),
      Home: () => getMondayOfWeekUTC(activeDate),
      End: () => addDaysUTC(getMondayOfWeekUTC(activeDate), 6),
    };
    if (moves[e.key]) {
      e.preventDefault();
      setActiveDate(moves[e.key]());
    } else if (e.key === "Escape") {
      // Keep Escape from also closing the surrounding dialog
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  // 6 weeks, Monday first, covering the month of activeDate
  const viewMonth = parseDateUTC(activeDate);
  const firstOfMonth = formatDateUTC(
    new Date(Date.UTC(viewMonth.getUTCFullYear(), viewMonth.getUTCMonth(), 1))
  );
  const gridStart = getMondayOfWeekUTC(firstOfMonth);
  const days = Array.from({ length: 42 }, (_, i) => addDaysUTC(gridStart, i));

  const display = formatDisplay(value);

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        aria-label={ariaLabel}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={(e) => {
          if (!isOpen && e.key === "ArrowDown") {
            e.preventDefault();
            open();
          }
        }}
        className={`field w-full flex items-center justify-between gap-2 text-left tabular-nums cursor-pointer ${
          invalid ? "!border-[var(--today)]" : ""
        }`}
      >
        <span className={display ? "" : "text-[var(--muted)]"}>
          {display || "Pick a date"}
        </span>
        <svg
          viewBox="0 0 16 16"
          className="w-4 h-4 shrink-0 text-[var(--muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="12" height="11" rx="2" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
        </svg>
      </button>

      {isOpen && pos && (
        <div
          ref={popupRef}
          id={dialogId}
          role="dialog"
          aria-label="Choose date"
          onKeyDown={handleGridKeyDown}
          style={{
            position: "fixed",
            left: pos.left,
            top: pos.top,
            width: POPUP_WIDTH,
          }}
          className="z-[70] rounded-[8px] border border-[var(--line)] bg-[var(--surface-2)] p-3 shadow-[var(--dialog-shadow)]"
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setActiveDate(shiftMonth(activeDate, -1))}
              aria-label="Previous month"
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] cursor-pointer"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m10 3.5-4.5 4.5 4.5 4.5" />
              </svg>
            </button>
            <span className="text-[13px] font-semibold text-[var(--ink)]" aria-live="polite">
              {MONTHS[viewMonth.getUTCMonth()]} {viewMonth.getUTCFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setActiveDate(shiftMonth(activeDate, 1))}
              aria-label="Next month"
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] cursor-pointer"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 3.5 4.5 4.5L6 12.5" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                className="h-7 flex items-center justify-center text-[11px] font-medium text-[var(--muted)]"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5" role="grid">
            {days.map((date) => {
              const d = parseDateUTC(date);
              const inMonth = d.getUTCMonth() === viewMonth.getUTCMonth();
              const isSelected = date === value;
              const isToday = date === today;
              const isActive = date === activeDate;
              return (
                <button
                  key={date}
                  type="button"
                  data-date={date}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={formatDisplay(date)}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  onClick={() => select(date)}
                  className={`h-8 rounded-[6px] flex items-center justify-center text-[12.5px] tabular-nums cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[var(--accent)] text-[var(--on-accent)] font-semibold"
                      : `hover:bg-[var(--hover)] ${
                          inMonth ? "text-[var(--ink)]" : "text-[var(--muted)]/50"
                        } ${isToday ? "ring-1 ring-inset ring-[var(--today)] text-[var(--today)] font-semibold" : ""}`
                  }`}
                >
                  {d.getUTCDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-[var(--line)] flex justify-end">
            <button
              type="button"
              onClick={() => select(today)}
              className="btn btn-ghost h-7 px-2 text-[12px]"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </>
  );
}
