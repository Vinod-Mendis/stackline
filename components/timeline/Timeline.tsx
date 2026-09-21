"use client";

import React, { useMemo, useState } from "react";
import { Category, Project, ScheduledProject } from "../../types";
import { computeTimelineRange } from "../../lib/schedule";
import { getTodayDateString } from "../../lib/dates";
import { TimelineHeader } from "../shared/TimelineHeader";
import { TimelineContainer, useTimelineScroll } from "../shared/TimelineContainer";
import { FilterChips } from "../shared/FilterChips";
import { Legend } from "./Legend";
import { ProjectRow } from "./ProjectRow";
import { ProjectDialog } from "./ProjectDialog";

interface TimelineProps {
  projects: Project[];
  projectTypes: Category[];
  onAddProjectType: (category: Category) => void;
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

interface ProjectGroup {
  id: string;
  name: string;
  color?: string;
  projects: ScheduledProject[];
}

export function Timeline({
  projects,
  projectTypes,
  onAddProjectType,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}: TimelineProps) {
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [isGroupedByType, setIsGroupedByType] = useState(false);

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    project: Project | null;
  }>({
    isOpen: false,
    project: null,
  });

  const todayStr = useMemo(() => getTodayDateString(), []);

  // Compute shared axis from ALL projects (filtering hides rows only; date axis stays the same)
  const { range, scheduledProjects } = useMemo(() => {
    return computeTimelineRange(projects, todayStr);
  }, [projects, todayStr]);

  const { containerRef, scrollToToday } = useTimelineScroll(range.todayIndex);

  const categoriesMap = useMemo(() => {
    return new Map(projectTypes.map((c) => [c.id, c]));
  }, [projectTypes]);

  // Filter projects for display
  const visibleProjects = useMemo(() => {
    if (!selectedTypeId) return scheduledProjects;
    return scheduledProjects.filter((p) => p.typeId === selectedTypeId);
  }, [scheduledProjects, selectedTypeId]);

  // Group projects when "Group by type" is on
  const projectGroups = useMemo(() => {
    if (!isGroupedByType) return [];

    const groups: ProjectGroup[] = [];

    // Types in order of projectTypes array
    for (const type of projectTypes) {
      const matching = visibleProjects.filter((p) => p.typeId === type.id);
      if (matching.length > 0) {
        groups.push({
          id: type.id,
          name: type.name,
          color: type.color,
          projects: matching,
        });
      }
    }

    // "No type" group placed last
    const noTypeProjects = visibleProjects.filter(
      (p) => !p.typeId || !categoriesMap.has(p.typeId)
    );
    if (noTypeProjects.length > 0) {
      groups.push({
        id: "__NO_TYPE__",
        name: "No type",
        projects: noTypeProjects,
      });
    }

    return groups;
  }, [isGroupedByType, projectTypes, visibleProjects, categoriesMap]);

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
      {/* Action Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-3 py-2 mb-3 border-b border-[var(--line)] shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <FilterChips
            categories={projectTypes}
            selectedCategoryId={selectedTypeId}
            onSelectCategory={setSelectedTypeId}
          />

          <div className="h-4 w-[1px] bg-[var(--line)] mx-0.5" />

          <button
            type="button"
            onClick={() => setIsGroupedByType((prev) => !prev)}
            className={`px-2.5 py-1 text-[12px] rounded-[6px] border transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
              isGroupedByType
                ? "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)] font-medium"
                : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
            }`}
          >
            Group by type
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
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

      {/* Main Unified 2D Scroll Container */}
      <TimelineContainer containerRef={containerRef}>
        {/* Sticky Header (Months & Days) */}
        <TimelineHeader
          months={range.months}
          days={range.days}
          cornerLabel="Projects"
        />

        {/* Project Rows */}
        {visibleProjects.length > 0 ? (
          <div className="flex flex-col">
            {isGroupedByType ? (
              // Grouped view
              projectGroups.map((group) => (
                <div key={group.id} className="flex flex-col">
                  {/* Slim group header row per type */}
                  <div className="flex flex-row h-[28px] border-b border-[var(--line)] bg-[var(--surface-2)]/60">
                    <div className="sticky left-0 z-10 w-[132px] sm:w-[210px] min-w-[132px] sm:min-w-[210px] shrink-0 bg-[var(--surface-2)] border-r border-[var(--line)] px-3 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--muted)] select-none">
                      {group.color && (
                        <span
                          className="w-2 h-2 rounded-[1px] shrink-0"
                          style={{ backgroundColor: group.color }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">{group.name}</span>
                      <span className="text-[10px] font-normal text-[var(--muted)]">
                        ({group.projects.length})
                      </span>
                    </div>
                    <div
                      style={{ width: `${range.totalDays * 36}px` }}
                      className="shrink-0 h-full bg-[var(--surface-2)]/30 border-b border-[var(--line)]"
                    />
                  </div>

                  {/* Rows inside group */}
                  {group.projects.map((schedProj) => {
                    const original =
                      projects.find((p) => p.id === schedProj.id) || schedProj;
                    const category = schedProj.typeId
                      ? categoriesMap.get(schedProj.typeId)
                      : undefined;

                    return (
                      <ProjectRow
                        key={schedProj.id}
                        project={schedProj}
                        category={category}
                        days={range.days}
                        todayIndex={range.todayIndex}
                        onEdit={() => handleOpenEdit(original)}
                      />
                    );
                  })}
                </div>
              ))
            ) : (
              // Flat view
              visibleProjects.map((schedProj) => {
                const original =
                  projects.find((p) => p.id === schedProj.id) || schedProj;
                const category = schedProj.typeId
                  ? categoriesMap.get(schedProj.typeId)
                  : undefined;

                return (
                  <ProjectRow
                    key={schedProj.id}
                    project={schedProj}
                    category={category}
                    days={range.days}
                    todayIndex={range.todayIndex}
                    onEdit={() => handleOpenEdit(original)}
                  />
                );
              })
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 px-6 text-center text-[13px] text-[var(--muted)]">
            {selectedTypeId
              ? "No projects match the selected type."
              : 'No projects yet. Click "New project" to start planning.'}
          </div>
        )}
      </TimelineContainer>

      {/* Legend below grid */}
      <div className="shrink-0 mt-3">
        <Legend projects={scheduledProjects} />
      </div>

      {/* Editor Modal Dialog */}
      <ProjectDialog
        isOpen={dialogState.isOpen}
        project={dialogState.project}
        categories={projectTypes}
        onAddCategory={onAddProjectType}
        onSave={handleSaveProject}
        onDelete={onDeleteProject}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
