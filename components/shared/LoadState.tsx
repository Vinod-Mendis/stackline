"use client";

import React from "react";
import { loadState, useSyncStatus } from "../../lib/store";

interface LoadStateProps {
  label: string;
}

/** Full-page placeholder shown while data loads, or when loading failed. */
export function LoadState({ label }: LoadStateProps) {
  const { load } = useSyncStatus();

  return (
    <div className="h-full w-full bg-[var(--surface)] flex flex-col items-center justify-center select-none px-4">
      <div className="w-full max-w-sm border border-[var(--line)] bg-[var(--surface-2)] rounded-[8px] p-8 text-center text-[13px] text-[var(--muted)] flex flex-col items-center gap-3">
        {load === "error" ? (
          <>
            <p className="text-[var(--ink)] font-medium">Couldn&apos;t load your data</p>
            <p>Check the database connection and try again.</p>
            <button
              type="button"
              onClick={() => void loadState(true)}
              className="btn btn-primary mt-1"
            >
              Retry
            </button>
          </>
        ) : (
          <p>{label}</p>
        )}
      </div>
    </div>
  );
}
