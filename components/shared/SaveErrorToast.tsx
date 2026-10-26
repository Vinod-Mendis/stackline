"use client";

import React from "react";
import { useSyncStatus } from "../../lib/store";

/** Warns when a change could not be saved to the database. */
export function SaveErrorToast() {
  const { saveFailed } = useSyncStatus();
  if (!saveFailed) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 right-4 z-[60] max-w-xs rounded-[8px] border border-[var(--today)]/40 bg-[var(--surface-2)] px-3.5 py-2.5 text-[12.5px] text-[var(--ink)]"
    >
      Your latest change couldn&apos;t be saved. It will retry on the next edit.
    </div>
  );
}
