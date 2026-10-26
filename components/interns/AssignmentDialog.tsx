"use client";

import { DatePicker } from "../shared/DatePicker";
import { Select } from "../shared/Select";
import React, { useState } from "react";
import { Assignment, Category, Intern } from "../../types";
import { addDaysUTC, getTodayDateString } from "../../lib/dates";
import { ModalDialog } from "../shared/ModalDialog";
import { CategorySelect } from "../shared/CategorySelect";

interface AssignmentDialogProps {
  isOpen: boolean;
  assignment: Assignment | null;
  interns: Intern[];
  defaultInternId?: string;
  kinds: Category[];
  onAddKind: (category: Category) => void;
  onSave: (internId: string, assignment: Assignment) => void;
  onDelete?: (internId: string, assignmentId: string) => void;
  onClose: () => void;
}

interface AssignmentFormProps {
  assignment: Assignment | null;
  interns: Intern[];
  defaultInternId?: string;
  kinds: Category[];
  onAddKind: (category: Category) => void;
  onSave: (internId: string, assignment: Assignment) => void;
  onDelete?: (internId: string, assignmentId: string) => void;
  onClose: () => void;
}

function AssignmentForm({
  assignment,
  interns,
  defaultInternId,
  kinds,
  onAddKind,
  onSave,
  onDelete,
  onClose,
}: AssignmentFormProps) {
  const today = getTodayDateString();
  const defaultEnd = addDaysUTC(today, 6);

  const initialInternId =
    defaultInternId ||
    (assignment
      ? interns.find((i) => i.assignments.some((a) => a.id === assignment.id))?.id
      : interns[0]?.id) ||
    "";

  const [internId, setInternId] = useState(initialInternId);
  const [title, setTitle] = useState(assignment ? assignment.title : "");
  const [kindId, setKindId] = useState<string | undefined>(
    assignment ? assignment.kindId : kinds[0]?.id
  );
  const [startDate, setStartDate] = useState(
    assignment ? assignment.startDate : today
  );
  const [endDate, setEndDate] = useState(
    assignment ? assignment.endDate : defaultEnd
  );
  const [dateError, setDateError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (endDate && val && endDate < val) {
      setDateError("End date cannot be before start date");
    } else {
      setDateError(null);
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (startDate && val && val < startDate) {
      setDateError("End date cannot be before start date");
    } else {
      setDateError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (endDate < startDate) {
      setDateError("End date cannot be before start date");
      return;
    }

    const resolvedKindId = kindId || kinds[0]?.id || "kind-client";
    const finalTitle = title.trim() || "Untitled assignment";

    const savedAssignment: Assignment = {
      id: assignment ? assignment.id : `asg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: finalTitle,
      kindId: resolvedKindId,
      startDate,
      endDate,
    };

    onSave(internId, savedAssignment);
    onClose();
  };

  const handleDelete = () => {
    if (!assignment || !onDelete) return;
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    onDelete(internId, assignment.id);
    onClose();
  };

  const isEditMode = !!assignment;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
        <h2
          id="assignment-dialog-title"
          className="text-[17px] font-semibold text-[var(--ink)]"
        >
          {isEditMode ? "Edit assignment" : "New assignment"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="w-7 h-7 rounded-[5px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 overflow-y-auto flex flex-col gap-4">
        {/* Intern Selector */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="assignment-intern"
            className="text-[12px] font-medium text-[var(--ink)]"
          >
            Intern
          </label>
          <Select
            id="assignment-intern"
            value={internId}
            onChange={setInternId}
            options={interns.map((intern) => ({
              value: intern.id,
              label: intern.name,
            }))}
          />
        </div>

        {/* Assignment Title */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="assignment-title"
            className="text-[12px] font-medium text-[var(--ink)]"
          >
            Title
          </label>
          <input
            id="assignment-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design System Audit"
            className="h-9 px-3 text-[13px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[6px] text-[var(--ink)] placeholder:text-[var(--muted)]/70 focus:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          />
        </div>

        {/* Kind Select */}
        <CategorySelect
          id="assignment-kind"
          label="Kind"
          categories={kinds}
          selectedId={kindId}
          onChange={setKindId}
          onAddCategory={onAddKind}
          placeholder="Select kind..."
          newOptionLabel="New kind..."
          allowNone={false}
        />

        {/* Date Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="assignment-start-date"
              className="text-[12px] font-medium text-[var(--ink)]"
            >
              Start date
            </label>
            <DatePicker
              id="assignment-start-date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="assignment-end-date"
              className="text-[12px] font-medium text-[var(--ink)]"
            >
              End date
            </label>
            <DatePicker
              id="assignment-end-date"
              value={endDate}
              onChange={handleEndDateChange}
              invalid={!!dateError}
            />
          </div>
        </div>

        {/* Inline validation error message */}
        {dateError && (
          <div
            role="alert"
            className="text-[12px] font-medium text-[var(--today)] flex items-center gap-1.5"
          >
            <span>⚠</span>
            <span>{dateError}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--line)] bg-[var(--surface-2)]/40">
        <div>
          {isEditMode && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className={`btn ${isConfirmingDelete ? "btn-danger" : "btn-danger-outline"}`}
            >
              {isConfirmingDelete
                ? "Click to confirm delete"
                : "Delete assignment"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!!dateError}
            className="btn btn-primary"
          >
            Save assignment
          </button>
        </div>
      </div>
    </form>
  );
}

export function AssignmentDialog({
  isOpen,
  assignment,
  interns,
  defaultInternId,
  kinds,
  onAddKind,
  onSave,
  onDelete,
  onClose,
}: AssignmentDialogProps) {
  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      titleId="assignment-dialog-title"
    >
      <AssignmentForm
        key={`${assignment?.id ?? "new"}-${defaultInternId ?? ""}-${isOpen}`}
        assignment={assignment}
        interns={interns}
        defaultInternId={defaultInternId}
        kinds={kinds}
        onAddKind={onAddKind}
        onSave={onSave}
        onDelete={onDelete}
        onClose={onClose}
      />
    </ModalDialog>
  );
}
