"use client";

import React from "react";
import { TimelineMonthGroup, TimelineDay } from "../../types";

interface TimelineHeaderProps {
  months: TimelineMonthGroup[];
  days: TimelineDay[];
}

export function TimelineHeader({ months, days }: TimelineHeaderProps) {
  return (
    <div className="flex flex-col sticky top-0 z-20 select-none">
      {/* Row 1: Month labels */}
      <div className="flex flex-row h-[28px] border-b border-[var(--line)] bg-[var(--surface)]">
        {/* Top-left sticky corner spacer (Months level) */}
        <div className="sticky left-0 z-30 w-[132px] sm:w-[210px] min-w-[132px] sm:min-w-[210px] shrink-0 bg-[var(--surface)] border-r border-[var(--line)] px-3 flex items-center">
          <span className="text-[11px] font-medium text-[var(--muted)]">
            Projects
          </span>
        </div>

        {/* Month spanning cells */}
        <div className="flex flex-row flex-nowrap">
          {months.map((month) => (
            <div
              key={`${month.year}-${month.month}-${month.startIndex}`}
              style={{ width: `${month.dayCount * 36}px` }}
              className="shrink-0 h-[28px] border-r border-[var(--line)] px-2 flex items-center text-[12px] font-medium text-[var(--ink)] tabular-nums"
            >
              {month.label}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Weekday initials and day numbers */}
      <div className="flex flex-row h-[36px] border-b border-[var(--line)] bg-[var(--surface)]">
        {/* Top-left sticky corner spacer (Days level) */}
        <div className="sticky left-0 z-30 w-[132px] sm:w-[210px] min-w-[132px] sm:min-w-[210px] shrink-0 bg-[var(--surface)] border-r border-[var(--line)] px-3 flex items-center">
          <span className="text-[10px] text-[var(--muted)]">
            Schedule
          </span>
        </div>

        {/* Day columns */}
        <div className="flex flex-row flex-nowrap">
          {days.map((day) => {
            const isMonday = day.isMonday;
            const isWeekend = day.isWeekend;
            const isToday = day.isToday;

            return (
              <div
                key={day.date}
                style={{ width: "36px" }}
                className={`shrink-0 h-[36px] flex flex-col items-center justify-center ${
                  isWeekend ? "bg-[var(--surface-2)]" : "bg-[var(--surface)]"
                } ${
                  isMonday
                    ? "border-r border-[var(--ink)]/25"
                    : "border-r border-[var(--line)]/50"
                }`}
                title={day.date}
              >
                <span className="text-[9px] leading-tight text-[var(--muted)] font-medium">
                  {day.weekdayInitial}
                </span>

                {isToday ? (
                  <span
                    className="w-[18px] h-[18px] rounded-full border-2 border-[var(--today)] text-[var(--today)] font-bold text-[10px] flex items-center justify-center leading-none tabular-nums"
                    aria-label={`Today, ${day.date}`}
                  >
                    {day.dayOfMonth}
                  </span>
                ) : (
                  <span className="text-[11px] leading-tight text-[var(--ink)] tabular-nums font-normal">
                    {day.dayOfMonth}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
