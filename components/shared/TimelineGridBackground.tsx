"use client";

import React from "react";
import { TimelineDay } from "../../types";

interface TimelineGridBackgroundProps {
  days: TimelineDay[];
  todayIndex?: number;
}

export function TimelineGridBackground({
  days,
  todayIndex,
}: TimelineGridBackgroundProps) {
  return (
    <>
      {/* Background day columns */}
      {days.map((day) => {
        const isWeekend = day.isWeekend;
        const isMonday = day.isMonday;

        return (
          <div
            key={day.date}
            style={{ width: "36px" }}
            className={`shrink-0 h-full ${
              isWeekend ? "bg-[var(--surface-2)]/60" : "bg-transparent"
            } ${
              isMonday
                ? "border-r border-[var(--ink)]/15"
                : "border-r border-[var(--line)]/40"
            }`}
          />
        );
      })}

      {/* Today vertical line */}
      {typeof todayIndex === "number" && todayIndex >= 0 && (
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-[var(--today)]/75 pointer-events-none z-10"
          style={{ left: `${todayIndex * 36 + 18}px` }}
        />
      )}
    </>
  );
}
