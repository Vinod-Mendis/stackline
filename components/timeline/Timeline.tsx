"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Project } from "../../types";
import { computeTimelineRange } from "../../lib/schedule";
import { getTodayDateString } from "../../lib/dates";
import { TimelineHeader } from "./TimelineHeader";
import { ProjectRow } from "./ProjectRow";
import { Legend } from "./Legend";
import { ProjectDialog } from "./ProjectDialog";

interface TimelineProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export function Timeline({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}: TimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolledRef = useRef(false);

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({
    isOpen: false,
    project: null,
  });

  const todayStr = useMemo(() => getTodayDateString(), []);

  // Compute shared axis and all project placements
  const { range, scheduledProjects } = useMemo(() => {
    return computeTimelineRange(projects, todayStr);
  }, [projects, todayStr]);

  const scrollToToday = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const container = scrollContainerRef.current;
      if (!container || range.todayIndex < 0) return;

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const todayPixelOffset = range.todayIndex * 36;
      const leftColOffset = window.innerWidth < 640 ? 132 : 210;
      const targetLeft = Math.max(
        0,
        todayPixelOffset - (container.clientWidth - leftColOffset) / 2 + 36
      );

      container.scrollTo({
        left: targetLeft,
        behavior: prefersReducedMotion ? "auto" : behavior,
      });
    },
    [range.todayIndex]
  );

  // Scroll to today on initial mount
  useEffect(() => {
    if (!hasInitiallyScrolledRef.current && range.todayIndex >= 0) {
      const timer = setTimeout(() => {
        scrollToToday("auto");
        hasInitiallyScrolledRef.current = true;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [range.todayIndex, scrollToToday]);

  // Enable sideways scrolling via mouse wheel and trackpad
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Do not hijack browser zoom or OS shortcuts
      if (e.ctrlKey || e.altKey) return;

      // If trackpad or horizontal mouse wheel produces native deltaX, let it scroll
      if (Math.abs(e.deltaX) > 0) {
        return;
      }

      // Convert vertical mouse wheel roll (deltaY) to sideways timeline scrolling
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const handleOpenCreate = () => {
    setDialogState({ isOpen: true, project: null });
  };

  const handleOpenEdit = (project: Project) => {
    setDialogState({ isOpen: true, project });
  };

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, project: null });
  };

  const handleSaveProject = (savedProject: Project) => {
    if (dialogState.project) {
      onUpdateProject(savedProject);
    } else {
      onAddProject(savedProject);
    }
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between py-2 mb-3 border-b border-[var(--line)] shrink-0">
        <div className="flex items-center">
          <Image
            src="/brand/stackline.svg"
            alt="Stackline"
            width={48}
            height={34}
            className="h-8.5 sm:h-9 w-auto object-contain shrink-0 select-none"
            priority
          />
          <h1 className="sr-only">Stackline</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollToToday("smooth")}
            className="px-3 py-1.5 text-[12px] font-medium text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)] rounded-[6px] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] cursor-pointer"
          >
            Go to today
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3.5 py-1.5 text-[12px] font-semibold text-black bg-white hover:bg-[#F3F6F9] rounded-[6px] border border-[var(--line)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] cursor-pointer"
          >
            New project
          </button>
        </div>
      </header>

      {/* Main Unified 2D Scroll Container filling remaining vertical height */}
      <div
        ref={scrollContainerRef}
        className="timeline-scrollbar flex-1 min-h-0 w-full relative overflow-auto overscroll-x-contain border border-[var(--line)] rounded-[8px] bg-[var(--surface)]"
      >
        <div className="inline-flex flex-col min-w-full min-h-full">
          {/* Sticky Header (Months & Days) */}
          <TimelineHeader months={range.months} days={range.days} />

          {/* Project Rows */}
          {scheduledProjects.length > 0 ? (
            <div className="flex flex-col">
              {scheduledProjects.map((schedProj) => {
                const original =
                  projects.find((p) => p.id === schedProj.id) || schedProj;
                return (
                  <ProjectRow
                    key={schedProj.id}
                    project={schedProj}
                    days={range.days}
                    todayIndex={range.todayIndex}
                    onEdit={() => handleOpenEdit(original)}
                  />
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 px-6 text-center text-[13px] text-[var(--muted)]">
              No projects yet. Click &ldquo;New project&rdquo; to start planning.
            </div>
          )}
        </div>
      </div>

      {/* Legend below the timeline board */}
      <div className="shrink-0 mt-3">
        <Legend projects={scheduledProjects} />
      </div>

      {/* Editor Modal Dialog */}
      <ProjectDialog
        isOpen={dialogState.isOpen}
        project={dialogState.project}
        onSave={handleSaveProject}
        onDelete={onDeleteProject}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
