"use client";

import React from "react";
import { Category, ScheduledProject, TimelineDay } from "../../types";
import { formatDateRange, formatDuration } from "../../lib/dates";
import { PhaseBar } from "./PhaseBar";
import { TimelineGridBackground } from "../shared/TimelineGridBackground";

interface ProjectRowProps {
  project: ScheduledProject;
  category?: Category;
  days: TimelineDay[];
  todayIndex?: number;
  onEdit: () => void;
}

export function ProjectRow({
  project,
  category,
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
      <div className="sticky left-0 z-10 w-[132px] sm:w-[210px] min-w-[132px] sm:min-w-[210px] shrink-0 bg-[var(--surface)] border-r border-[var(--line)] px-3 py-1.5 flex flex-col justify-center select-none group-hover:bg-[var(--surface)]">
        {/* Project type name and 8px colored square (sentence case) */}
        {category && (
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[var(--muted)] font-medium leading-none mb-1 truncate">
            <span
              className="w-2 h-2 rounded-[1px] shrink-0"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
            <span className="truncate">{category.name}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onEdit}
          className="text-left font-['var(--font-bricolage)'] font-semibold text-[13px] sm:text-[14px] leading-tight text-[var(--ink)] truncate cursor-pointer hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] rounded"
          title={`Edit project: ${project.name}`}
        >
          {project.name || "Untitled project"}
        </button>

        <div className="text-[10px] sm:text-[11px] leading-tight text-[var(--muted)] tabular-nums truncate mt-0.5">
          <span>{dateRangeLabel}</span>
          <span className="mx-1">•</span>
          <span>{totalDaysLabel}</span>
        </div>
      </div>

      {/* Timeline track with day grid background & phase bars */}
      <div className="relative flex flex-row flex-nowrap shrink-0 h-[66px]">
        <TimelineGridBackground days={days} todayIndex={todayIndex} />

        {/* Phase Bars */}
        {project.phases.map((phase) => (
          <PhaseBar key={phase.id} phase={phase} onClick={onEdit} />
        ))}
      </div>
    </div>
  );
}

