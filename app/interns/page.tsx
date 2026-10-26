"use client";

import { LoadState } from "../../components/shared/LoadState";
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
    return <LoadState label="Loading interns timeline..." />;
  }

  return (
    <main className="h-full w-full bg-[var(--surface)] flex flex-col overflow-hidden">
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
