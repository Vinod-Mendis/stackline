"use client";

import React from "react";
import { Category, ScheduledAssignment, ScheduledIntern, TimelineDay } from "../../types";
import { getInternRowHeight } from "../../lib/lanes";
import { TimelineGridBackground } from "../shared/TimelineGridBackground";
import { AssignmentBar } from "./AssignmentBar";

interface InternRowProps {
  intern: ScheduledIntern;
  kindsMap: Map<string, Category>;
  days: TimelineDay[];
  todayIndex?: number;
  onEditIntern: () => void;
  onAddAssignment: () => void;
  onEditAssignment: (assignment: ScheduledAssignment) => void;
}

export function InternRow({
  intern,
  kindsMap,
  days,
  todayIndex,
  onEditIntern,
  onAddAssignment,
  onEditAssignment,
}: InternRowProps) {
  const rowHeight = getInternRowHeight(intern.totalLanes);

  const activeCountLabel =
    intern.activeTodayCount === 1
      ? "1 active today"
      : `${intern.activeTodayCount} active today`;

  return (
    <div
      style={{ height: `${rowHeight}px` }}
      className="flex flex-row border-b border-[var(--line)] hover:bg-[var(--surface-2)]/30 group"
    >
      {/* Sticky Left Column */}
      <div className="sticky left-0 z-10 w-[132px] sm:w-[210px] min-w-[132px] sm:min-w-[210px] shrink-0 bg-[var(--surface)] border-r border-[var(--line)] px-3 py-2 flex flex-col justify-between select-none group-hover:bg-[var(--surface)]">
        <div>
          <button
            type="button"
            onClick={onEditIntern}
            className="text-left font-['var(--font-bricolage)'] font-semibold text-[13px] sm:text-[14px] leading-tight text-[var(--ink)] truncate cursor-pointer hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] rounded"
            title={`Edit intern: ${intern.name}`}
          >
            {intern.name || "Untitled intern"}
          </button>

          <div className="text-[10px] sm:text-[11px] leading-tight text-[var(--muted)] tabular-nums mt-0.5">
            {activeCountLabel}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={onAddAssignment}
            className="text-[11px] font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] rounded cursor-pointer"
          >
            + Add assignment
          </button>
        </div>
      </div>

      {/* Timeline track with day grid background & assignment bars */}
      <div
        style={{ height: `${rowHeight}px` }}
        className="relative flex flex-row flex-nowrap shrink-0"
      >
        <TimelineGridBackground days={days} todayIndex={todayIndex} />

        {intern.assignments.map((assignment) => (
          <AssignmentBar
            key={assignment.id}
            assignment={assignment}
            category={kindsMap.get(assignment.kindId)}
            onClick={() => onEditAssignment(assignment)}
          />
        ))}
      </div>
    </div>
  );
}
