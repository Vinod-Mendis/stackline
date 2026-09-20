"use client";

import React from "react";
import { ScheduledProject, TimelineDay } from "../../types";
import { formatDateRange, formatDuration } from "../../lib/dates";
import { PhaseBar } from "./PhaseBar";

interface ProjectRowProps {
  project: ScheduledProject;
  days: TimelineDay[];
  todayIndex?: number;
  onEdit: () => void;
}

export function ProjectRow({
  project,
  days,
  todayIndex,
  onEdit,
}: ProjectRowProps) {
  const dateRangeLabel =
    project.phases.length > 0
      ? formatDateRange(project.startDate, project.endDate)
      : project.startDate;

  const totalDaysLabel =
    project.phases.length > 0
      ? formatDuration(project.totalDays, "days")
      : "No phases";

  return (
    <div className="flex flex-row h-[66px] border-b border-[var(--line)] hover:bg-[var(--surface-2)]/30 group">
      {/* Sticky Left Column */}
      <div className="sticky left-0 z-10 w-[132px] sm:w-[210px] min-w-[132px] sm:min-w-[210px] shrink-0 bg-[var(--surface)] border-r border-[var(--line)] px-3 py-2 flex flex-col justify-center select-none group-hover:bg-[var(--surface)]">
        <button
          type="button"
          onClick={onEdit}
          className="text-left font-['var(--font-bricolage)'] font-semibold text-[13px] sm:text-[14px] leading-tight text-[var(--ink)] truncate cursor-pointer hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] rounded"
          title={`Edit project: ${project.name}`}
        >
          {project.name || "Untitled project"}
        </button>

        <div className="text-[10px] sm:text-[11px] leading-tight text-[var(--muted)] tabular-nums truncate mt-1">
          <span>{dateRangeLabel}</span>
          <span className="mx-1">•</span>
          <span>{totalDaysLabel}</span>
        </div>
      </div>

      {/* Timeline track with day grid background & phase bars */}
      <div className="relative flex flex-row flex-nowrap shrink-0 h-[66px]">
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

        {/* Phase Bars */}
        {project.phases.map((phase) => (
          <PhaseBar key={phase.id} phase={phase} onClick={onEdit} />
        ))}
      </div>
    </div>
  );
}
