"use client";

import React from "react";
import { Category, ScheduledAssignment } from "../../types";
import { formatDateRange } from "../../lib/dates";
import { getAssignmentBarTop } from "../../lib/lanes";

interface AssignmentBarProps {
  assignment: ScheduledAssignment;
  category?: Category;
  onClick: () => void;
}

export function AssignmentBar({
  assignment,
  category,
  onClick,
}: AssignmentBarProps) {
  const leftPx = assignment.dayOffset * 36;
  const widthPx = Math.max(33, assignment.durationDays * 36 - 3);
  const topPx = getAssignmentBarTop(assignment.laneIndex); // 14 + laneIndex * 44

  const color = category ? category.color : "#5B6B7A";
  const kindName = category ? category.name : "Unknown kind";
  const dateRange = formatDateRange(assignment.startDate, assignment.endDate);
  const tooltip = `${assignment.title || "Untitled"} (${kindName}) • ${dateRange}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
        top: `${topPx}px`,
        height: "38px",
        backgroundColor: color,
      }}
      title={tooltip}
      className="absolute z-1 rounded-[5px] px-2.5 py-1 text-white flex flex-col justify-center cursor-pointer select-none transition-all duration-75 hover:brightness-110 active:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] overflow-hidden leading-tight"
    >
      <span className="text-[12px] font-semibold truncate leading-tight">
        {assignment.title || "Untitled"}
      </span>
      <span className="text-[10px] text-white/85 truncate leading-tight tabular-nums mt-0.5">
        <span>{kindName}</span>
        <span className="mx-1">•</span>
        <span>{dateRange}</span>
      </span>
    </div>
  );
}
