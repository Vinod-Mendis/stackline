"use client";

import { useAssignmentKindsStore, useInternsStore } from "../../lib/store";
import { InternTimeline } from "../../components/interns/InternTimeline";

export default function InternsPage() {
  const {
    interns,
    isLoaded: isInternsLoaded,
    addIntern,
    updateIntern,
    deleteIntern,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  } = useInternsStore();

  const {
    assignmentKinds,
    isLoaded: isKindsLoaded,
    addAssignmentKind,
  } = useAssignmentKindsStore();

  const isLoaded = isInternsLoaded && isKindsLoaded;

  if (!isLoaded) {
    return (
      <div className="h-full w-full bg-[var(--bg)] p-3 sm:p-4 flex flex-col items-center justify-center select-none">
        <div className="w-full max-w-lg border border-[var(--line)] bg-[var(--surface)] rounded-[8px] p-8 text-center text-[13px] text-[var(--muted)]">
          Loading interns timeline...
        </div>
      </div>
    );
  }

  return (
    <main className="h-full w-full bg-[var(--bg)] p-3 sm:p-4 flex flex-col overflow-hidden">
      <div className="w-full flex-1 flex flex-col min-h-0">
        <InternTimeline
          interns={interns}
          kinds={assignmentKinds}
          onAddKind={addAssignmentKind}
          onAddIntern={addIntern}
          onUpdateIntern={updateIntern}
          onDeleteIntern={deleteIntern}
          onAddAssignment={addAssignment}
          onUpdateAssignment={updateAssignment}
          onDeleteAssignment={deleteAssignment}
        />
      </div>
    </main>
  );
}
