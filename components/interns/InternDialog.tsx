"use client";

import React, { useState } from "react";
import { Intern } from "../../types";
import { ModalDialog } from "../shared/ModalDialog";

interface InternDialogProps {
  isOpen: boolean;
  intern: Intern | null;
  onSave: (name: string) => void;
  onDelete?: (internId: string) => void;
  onClose: () => void;
}

interface InternFormProps {
  intern: Intern | null;
  onSave: (name: string) => void;
  onDelete?: (internId: string) => void;
  onClose: () => void;
}

function InternForm({ intern, onSave, onDelete, onClose }: InternFormProps) {
  const [name, setName] = useState(intern ? intern.name : "");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || "Untitled intern";
    onSave(finalName);
    onClose();
  };

  const handleDelete = () => {
    if (!intern || !onDelete) return;
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    onDelete(intern.id);
    onClose();
  };

  const isEditMode = !!intern;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)]">
        <h2
          id="intern-dialog-title"
          className="font-['var(--font-bricolage)'] text-[17px] font-semibold text-[var(--ink)]"
        >
          {isEditMode ? "Edit intern" : "New intern"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="w-7 h-7 rounded-[5px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="intern-name"
            className="text-[12px] font-medium text-[var(--ink)]"
          >
            Intern name
          </label>
          <input
            id="intern-name"
            type="text"
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Rivera"
            className="h-9 px-3 text-[13px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[6px] text-[var(--ink)] placeholder:text-[var(--muted)]/70 focus:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)]"
          />
        </div>

        {isConfirmingDelete && (
          <div
            role="alert"
            className="p-2.5 rounded-[6px] bg-[var(--today)]/10 border border-[var(--today)]/25 text-[12px] text-[var(--today)] font-medium"
          >
            Are you sure? This intern&apos;s assignments will also be deleted.
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
              className={`px-3 py-1.5 text-[12px] font-medium rounded-[6px] border transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ink)] ${
                isConfirmingDelete
                  ? "bg-[var(--today)] text-white border-transparent hover:brightness-110"
                  : "text-[var(--today)] border-[var(--line)] hover:bg-[var(--surface)]"
              }`}
            >
              {isConfirmingDelete
                ? "Click to confirm delete"
                : "Delete intern"}
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
            Save intern
          </button>
        </div>
      </div>
    </form>
  );
}

export function InternDialog({
  isOpen,
  intern,
  onSave,
  onDelete,
  onClose,
}: InternDialogProps) {
  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} titleId="intern-dialog-title">
      <InternForm
        key={`${intern?.id ?? "new"}-${isOpen}`}
        intern={intern}
        onSave={onSave}
        onDelete={onDelete}
        onClose={onClose}
      />
    </ModalDialog>
  );
}
