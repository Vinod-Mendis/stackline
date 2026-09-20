"use client";

import React, { useEffect, useRef, useState } from "react";
import { Phase, PHASE_COLORS, Project } from "../../types";
import { getTodayDateString } from "../../lib/dates";
import { PhaseFields } from "./PhaseFields";

interface ProjectDialogProps {
  isOpen: boolean;
  project: Project | null;
  onSave: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onClose: () => void;
}

function createEmptyPhase(colorIndex = 0): Phase {
  return {
    id: `phase-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: "",
    amount: 1,
    unit: "weeks",
    color: PHASE_COLORS[colorIndex % PHASE_COLORS.length],
  };
}

interface ProjectFormProps {
  project: Project | null;
  onSave: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onClose: () => void;
}

function ProjectForm({ project, onSave, onDelete, onClose }: ProjectFormProps) {
  const [name, setName] = useState(project ? project.name : "");
  const [startDate, setStartDate] = useState(
    project ? project.startDate : getTodayDateString()
  );
  const [phases, setPhases] = useState<Phase[]>(() =>
    project && project.phases.length > 0
      ? project.phases
      : [createEmptyPhase(0)]
  );
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleAddPhase = () => {
    setPhases((prev) => [...prev, createEmptyPhase(prev.length)]);
  };

  const handlePhaseChange = (index: number, updated: Phase) => {
    setPhases((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const handleRemovePhase = (index: number) => {
    if (phases.length <= 1) return;
    setPhases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalProjectName = name.trim() || "Untitled project";
    const finalStartDate = startDate || getTodayDateString();

    const sanitizedPhases: Phase[] = phases.map((p) => ({
      id: p.id || `phase-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: p.name.trim() || "Untitled phase",
      amount: Math.max(1, Math.floor(p.amount) || 1),
      unit: p.unit,
      color: p.color,
    }));

    const savedProject: Project = {
      id: project ? project.id : `proj-${Date.now()}`,
      name: finalProjectName,
      startDate: finalStartDate,
      phases: sanitizedPhases,
    };

    onSave(savedProject);
    onClose();
  };

  const handleDelete = () => {
    if (!project || !onDelete) return;
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    onDelete(project.id);
    onClose();
  };

  const isEditMode = !!project;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
        <h2
          id="dialog-title"
          className="font-['var(--font-bricolage)'] text-[17px] font-semibold text-[var(--ink)]"
        >
          {isEditMode ? "Edit project" : "New project"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="w-7 h-7 rounded-[5px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
        >
          ✕
        </button>
      </div>

      {/* Content Body */}
      <div className="px-5 py-4 overflow-y-auto flex flex-col gap-4">
        {/* Project Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="project-name"
            className="text-[12px] font-medium text-[var(--ink)]"
          >
            Project name
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website redesign"
            className="h-9 px-3 text-[13px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[6px] text-[var(--ink)] placeholder:text-[var(--muted)]/70 focus:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
          />
        </div>

        {/* Start Date */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="project-start-date"
            className="text-[12px] font-medium text-[var(--ink)]"
          >
            Start date
          </label>
          <input
            id="project-start-date"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 px-3 text-[13px] tabular-nums bg-[var(--surface-2)] border border-[var(--line)] rounded-[6px] text-[var(--ink)] focus:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] cursor-pointer"
          />
        </div>

        {/* Phases Section */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--ink)]">
              Phases
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              Runs back-to-back
            </span>
          </div>

          <div className="flex flex-col divide-y divide-[var(--line)]/50 border-t border-b border-[var(--line)]">
            {phases.map((phase, idx) => (
              <PhaseFields
                key={phase.id}
                phase={phase}
                index={idx}
                totalPhases={phases.length}
                onChange={(updated) => handlePhaseChange(idx, updated)}
                onRemove={() => handleRemovePhase(idx)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddPhase}
            className="mt-1 self-start px-3 py-1.5 text-[12px] font-medium text-[var(--ink)] bg-[var(--surface-2)] hover:bg-[var(--surface)] border border-[var(--line)] rounded-[6px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] cursor-pointer"
          >
            + Add phase
          </button>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--line)] bg-[var(--surface-2)]/40">
        <div>
          {isEditMode && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] border transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
                isConfirmingDelete
                  ? "bg-[var(--today)] text-white border-transparent hover:brightness-110"
                  : "text-[var(--today)] border-[var(--line)] hover:bg-[var(--surface)]"
              }`}
            >
              {isConfirmingDelete ? "Click to confirm delete" : "Delete project"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-[12px] font-medium text-[var(--ink)] bg-[var(--surface)] border border-[var(--line)] rounded-[6px] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-[12px] font-semibold text-black bg-white hover:bg-[#F3F6F9] rounded-[6px] border border-[var(--line)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] cursor-pointer"
          >
            Save project
          </button>
        </div>
      </div>
    </form>
  );
}

export function ProjectDialog({
  isOpen,
  project,
  onSave,
  onDelete,
  onClose,
}: ProjectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      className="stackline-dialog fixed inset-0 m-auto z-50 w-full max-w-lg rounded-[8px] p-0 text-[var(--ink)] backdrop:backdrop-blur-[1px]"
      aria-labelledby="dialog-title"
    >
      <ProjectForm
        key={`${project?.id ?? "new"}-${isOpen}`}
        project={project}
        onSave={onSave}
        onDelete={onDelete}
        onClose={onClose}
      />
    </dialog>
  );
}
