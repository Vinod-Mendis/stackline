"use client";

import React, { useMemo, useState } from "react";
import { Assignment, Category, DateSpan, Intern, ScheduledAssignment } from "../../types";
import { computeTimelineRangeFromSpans, scheduleIntern } from "../../lib/schedule";
import { getTodayDateString } from "../../lib/dates";
import { TimelineContainer, useTimelineScroll } from "../shared/TimelineContainer";
import { TimelineHeader } from "../shared/TimelineHeader";
import { FilterChips } from "../shared/FilterChips";
import { Legend } from "../shared/Legend";
import { InternRow } from "./InternRow";
import { InternDialog } from "./InternDialog";
import { AssignmentDialog } from "./AssignmentDialog";

interface InternTimelineProps {
  interns: Intern[];
  kinds: Category[];
  onAddKind: (category: Category) => void;
  onAddIntern: (name: string) => string;
  onUpdateIntern: (internId: string, name: string) => void;
  onDeleteIntern: (internId: string) => void;
  onAddAssignment: (internId: string, assignment: Assignment) => void;
  onUpdateAssignment: (
    internId: string,
    assignment: Assignment,
    newInternId?: string
  ) => void;
  onDeleteAssignment: (internId: string, assignmentId: string) => void;
}

export function InternTimeline({
  interns,
  kinds,
  onAddKind,
  onAddIntern,
  onUpdateIntern,
  onDeleteIntern,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
}: InternTimelineProps) {
  const [selectedKindId, setSelectedKindId] = useState<string | null>(null);

  const [internDialog, setInternDialog] = useState<{
    isOpen: boolean;
    intern: Intern | null;
  }>({
    isOpen: false,
    intern: null,
  });

  const [assignmentDialog, setAssignmentDialog] = useState<{
    isOpen: boolean;
    assignment: Assignment | null;
    defaultInternId?: string;
  }>({
    isOpen: false,
    assignment: null,
  });

  const todayStr = useMemo(() => getTodayDateString(), []);

  // Compute shared axis from ALL assignments (filtering hides/filters assignments only; date axis stays the same)
  const range = useMemo(() => {
    const allSpans: DateSpan[] = [];
    for (const intern of interns) {
      for (const a of intern.assignments) {
        if (a.startDate && a.endDate) {
          allSpans.push({ startDate: a.startDate, endDate: a.endDate });
        }
      }
    }
    return computeTimelineRangeFromSpans(allSpans, todayStr);
  }, [interns, todayStr]);

  const { containerRef, scrollToToday } = useTimelineScroll(range.todayIndex);

  const kindsMap = useMemo(() => {
    return new Map(kinds.map((k) => [k.id, k]));
  }, [kinds]);

  // Schedule interns against timeline range start, filtering assignments if selectedKindId is active
  const scheduledInterns = useMemo(() => {
    return interns.map((intern) => {
      const assignmentsToSchedule = selectedKindId
        ? intern.assignments.filter((a) => a.kindId === selectedKindId)
        : intern.assignments;

      return scheduleIntern(
        { ...intern, assignments: assignmentsToSchedule },
        range.startDate,
        todayStr
      );
    });
  }, [interns, selectedKindId, range.startDate, todayStr]);

  const handleOpenAddIntern = () => {
    setInternDialog({ isOpen: true, intern: null });
  };

  const handleOpenEditIntern = (intern: Intern) => {
    setInternDialog({ isOpen: true, intern });
  };

  const handleCloseInternDialog = () => {
    setInternDialog({ isOpen: false, intern: null });
  };

  const handleSaveIntern = (name: string) => {
    if (internDialog.intern) {
      onUpdateIntern(internDialog.intern.id, name);
    } else {
      onAddIntern(name);
    }
  };

  const handleOpenAddAssignment = (internId?: string) => {
    setAssignmentDialog({
      isOpen: true,
      assignment: null,
      defaultInternId: internId || interns[0]?.id,
    });
  };

  const handleOpenEditAssignment = (
    internId: string,
    assignment: ScheduledAssignment
  ) => {
    setAssignmentDialog({
      isOpen: true,
      assignment,
      defaultInternId: internId,
    });
  };

  const handleCloseAssignmentDialog = () => {
    setAssignmentDialog({
      isOpen: false,
      assignment: null,
      defaultInternId: undefined,
    });
  };

  const handleSaveAssignment = (internId: string, assignment: Assignment) => {
    if (assignmentDialog.assignment) {
      // Edit existing assignment (might be moved to another intern)
      const currentIntern = interns.find((i) =>
        i.assignments.some((a) => a.id === assignment.id)
      );
      const currentInternId = currentIntern ? currentIntern.id : internId;
      onUpdateAssignment(currentInternId, assignment, internId);
    } else {
      // New assignment
      onAddAssignment(internId, assignment);
    }
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-3 py-2 mb-3 border-b border-[var(--line)] shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <FilterChips
            categories={kinds}
            selectedCategoryId={selectedKindId}
            onSelectCategory={setSelectedKindId}
          />
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
            onClick={handleOpenAddIntern}
            className="px-3.5 py-1.5 text-[12px] font-semibold text-black bg-white hover:bg-[#F3F6F9] rounded-[6px] border border-[var(--line)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] cursor-pointer"
          >
            Add intern
          </button>
        </div>
      </header>

      {/* Main Unified 2D Scroll Container */}
      <TimelineContainer containerRef={containerRef}>
        {/* Sticky Header (Months & Days) */}
        <TimelineHeader
          months={range.months}
          days={range.days}
          cornerLabel="Interns"
        />

        {/* Intern Rows */}
        {scheduledInterns.length > 0 ? (
          <div className="flex flex-col">
            {scheduledInterns.map((schedIntern) => {
              const original =
                interns.find((i) => i.id === schedIntern.id) || schedIntern;

              return (
                <InternRow
                  key={schedIntern.id}
                  intern={schedIntern}
                  kindsMap={kindsMap}
                  days={range.days}
                  todayIndex={range.todayIndex}
                  onEditIntern={() => handleOpenEditIntern(original)}
                  onAddAssignment={() => handleOpenAddAssignment(original.id)}
                  onEditAssignment={(asg) =>
                    handleOpenEditAssignment(original.id, asg)
                  }
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 px-6 text-center text-[13px] text-[var(--muted)]">
            No interns yet. Click &ldquo;Add intern&rdquo; to start tracking.
          </div>
        )}
      </TimelineContainer>

      {/* Legend below grid */}
      <div className="shrink-0 mt-3">
        <Legend
          title="Kinds:"
          items={kinds.map((k) => ({ label: k.name, color: k.color }))}
        />
      </div>

      {/* Intern Dialog */}
      <InternDialog
        isOpen={internDialog.isOpen}
        intern={internDialog.intern}
        onSave={handleSaveIntern}
        onDelete={onDeleteIntern}
        onClose={handleCloseInternDialog}
      />

      {/* Assignment Dialog */}
      <AssignmentDialog
        isOpen={assignmentDialog.isOpen}
        assignment={assignmentDialog.assignment}
        interns={interns}
        defaultInternId={assignmentDialog.defaultInternId}
        kinds={kinds}
        onAddKind={onAddKind}
        onSave={handleSaveAssignment}
        onDelete={onDeleteAssignment}
        onClose={handleCloseAssignmentDialog}
      />
    </div>
  );
}
