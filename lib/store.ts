"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Assignment, Category, Intern, Project } from "../types";
import {
  validateCategories,
  validateInterns,
  validateProjects,
} from "./validate";
import type { StateKey } from "./state-keys";

export {
  validateCategories,
  validateInterns,
  validateProjects,
} from "./validate";

// ---------------------------------------------------------------------------
// Sync status (load from / save to MongoDB through /api/state)
// ---------------------------------------------------------------------------

export interface SyncStatus {
  /** "loading" until the first fetch finishes; "error" if it failed. */
  load: "loading" | "ready" | "error";
  /** True when the last attempt to save a change failed. */
  saveFailed: boolean;
}

let syncStatus: SyncStatus = { load: "loading", saveFailed: false };
let statusListeners: Array<() => void> = [];

function setSyncStatus(patch: Partial<SyncStatus>) {
  syncStatus = { ...syncStatus, ...patch };
  for (const listener of statusListeners) listener();
}

const statusStore = {
  subscribe(listener: () => void) {
    statusListeners = [...statusListeners, listener];
    return () => {
      statusListeners = statusListeners.filter((l) => l !== listener);
    };
  },
  getSnapshot: () => syncStatus,
  getServerSnapshot: (): SyncStatus => ({ load: "loading", saveFailed: false }),
};

const SERVER_STATUS = statusStore.getServerSnapshot();

// ---------------------------------------------------------------------------
// Generic collection store
// ---------------------------------------------------------------------------

interface CollectionStore<T> {
  subscribe(listener: () => void): () => void;
  getSnapshot(): T[];
  getServerSnapshot(): T[];
  /** Replaces the collection locally and persists it to MongoDB. */
  set(updated: T[]): void;
  /** Replaces the collection locally only (used by the initial load). */
  hydrate(data: T[]): void;
}

const EMPTY: never[] = [];

function createCollectionStore<T>(key: StateKey): CollectionStore<T> {
  let listeners: Array<() => void> = [];
  let cache: T[] = EMPTY;
  // Saves for one key run one at a time so older writes can't land after newer ones
  let saveChain: Promise<void> = Promise.resolve();

  const emit = () => {
    for (const listener of listeners) listener();
  };

  return {
    subscribe(listener) {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
    getSnapshot: () => cache,
    getServerSnapshot: () => EMPTY,
    hydrate(data) {
      cache = data;
      emit();
    },
    set(updated) {
      // Never write before a successful load: it could overwrite saved data
      if (syncStatus.load !== "ready") return;
      cache = updated;
      emit();

      saveChain = saveChain.then(async () => {
        try {
          const res = await fetch(`/api/state/${key}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cache),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          if (syncStatus.saveFailed) setSyncStatus({ saveFailed: false });
        } catch (error) {
          console.error(`Failed to save ${key}:`, error);
          setSyncStatus({ saveFailed: true });
        }
      });
    },
  };
}

export const projectStore = createCollectionStore<Project>("projects");
export const projectTypesStore = createCollectionStore<Category>("projectTypes");
export const assignmentKindsStore =
  createCollectionStore<Category>("assignmentKinds");
export const internsStore = createCollectionStore<Intern>("interns");

// ---------------------------------------------------------------------------
// Initial load
// ---------------------------------------------------------------------------

let loadPromise: Promise<void> | null = null;

export function loadState(force = false): Promise<void> {
  if (loadPromise && !force) return loadPromise;

  setSyncStatus({ load: "loading" });
  loadPromise = (async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Record<string, unknown> = await res.json();

      if (
        !validateProjects(data.projects) ||
        !validateCategories(data.projectTypes) ||
        !validateCategories(data.assignmentKinds) ||
        !validateInterns(data.interns)
      ) {
        throw new Error("Unexpected data shape");
      }

      projectStore.hydrate(data.projects);
      projectTypesStore.hydrate(data.projectTypes);
      assignmentKindsStore.hydrate(data.assignmentKinds);
      internsStore.hydrate(data.interns);
      setSyncStatus({ load: "ready" });
    } catch (error) {
      console.error("Failed to load data:", error);
      setSyncStatus({ load: "error" });
    }
  })();
  return loadPromise;
}

// ---------------------------------------------------------------------------
// Custom Hooks
// ---------------------------------------------------------------------------

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    statusStore.subscribe,
    statusStore.getSnapshot,
    () => SERVER_STATUS
  );
}

/** True once data has been fetched from the database. */
export function useIsLoaded() {
  const { load } = useSyncStatus();

  useEffect(() => {
    void loadState();
  }, []);

  return load === "ready";
}

export function useProjectStore() {
  const projects = useSyncExternalStore(
    projectStore.subscribe,
    projectStore.getSnapshot,
    projectStore.getServerSnapshot
  );

  const isLoaded = useIsLoaded();

  const addProject = (project: Project) => {
    const current = projectStore.getSnapshot();
    const updated = [...current, project];
    projectStore.set(updated);
  };

  const updateProject = (project: Project) => {
    const current = projectStore.getSnapshot();
    const updated = current.map((p) => (p.id === project.id ? project : p));
    projectStore.set(updated);
  };

  const deleteProject = (projectId: string) => {
    const current = projectStore.getSnapshot();
    const updated = current.filter((p) => p.id !== projectId);
    projectStore.set(updated);
  };

  return {
    projects,
    isLoaded,
    addProject,
    updateProject,
    deleteProject,
  };
}

export function useProjectTypesStore() {
  const projectTypes = useSyncExternalStore(
    projectTypesStore.subscribe,
    projectTypesStore.getSnapshot,
    projectTypesStore.getServerSnapshot
  );

  const isLoaded = useIsLoaded();

  const addProjectType = (category: Category) => {
    const current = projectTypesStore.getSnapshot();
    const updated = [...current, category];
    projectTypesStore.set(updated);
  };

  return {
    projectTypes,
    isLoaded,
    addProjectType,
  };
}

export function useAssignmentKindsStore() {
  const assignmentKinds = useSyncExternalStore(
    assignmentKindsStore.subscribe,
    assignmentKindsStore.getSnapshot,
    assignmentKindsStore.getServerSnapshot
  );

  const isLoaded = useIsLoaded();

  const addAssignmentKind = (category: Category) => {
    const current = assignmentKindsStore.getSnapshot();
    const updated = [...current, category];
    assignmentKindsStore.set(updated);
  };

  return {
    assignmentKinds,
    isLoaded,
    addAssignmentKind,
  };
}

export function useInternsStore() {
  const interns = useSyncExternalStore(
    internsStore.subscribe,
    internsStore.getSnapshot,
    internsStore.getServerSnapshot
  );

  const isLoaded = useIsLoaded();

  const addIntern = (name: string): string => {
    const id = `intern-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newIntern: Intern = {
      id,
      name: name.trim() || "Untitled intern",
      assignments: [],
    };
    const current = internsStore.getSnapshot();
    internsStore.set([...current, newIntern]);
    return id;
  };

  const updateIntern = (internId: string, name: string) => {
    const current = internsStore.getSnapshot();
    const updated = current.map((i) =>
      i.id === internId ? { ...i, name: name.trim() || "Untitled intern" } : i
    );
    internsStore.set(updated);
  };

  const deleteIntern = (internId: string) => {
    const current = internsStore.getSnapshot();
    const updated = current.filter((i) => i.id !== internId);
    internsStore.set(updated);
  };

  const addAssignment = (internId: string, assignment: Assignment) => {
    const current = internsStore.getSnapshot();
    const updated = current.map((intern) => {
      if (intern.id === internId) {
        return {
          ...intern,
          assignments: [...intern.assignments, assignment],
        };
      }
      return intern;
    });
    internsStore.set(updated);
  };

  const updateAssignment = (
    internId: string,
    assignment: Assignment,
    newInternId?: string
  ) => {
    const current = internsStore.getSnapshot();
    const targetInternId = newInternId ?? internId;

    if (targetInternId === internId) {
      // Same intern: update in place
      const updated = current.map((intern) => {
        if (intern.id === internId) {
          return {
            ...intern,
            assignments: intern.assignments.map((a) =>
              a.id === assignment.id ? assignment : a
            ),
          };
        }
        return intern;
      });
      internsStore.set(updated);
    } else {
      // Moved to a different intern
      const updated = current.map((intern) => {
        if (intern.id === internId) {
          return {
            ...intern,
            assignments: intern.assignments.filter((a) => a.id !== assignment.id),
          };
        }
        if (intern.id === targetInternId) {
          return {
            ...intern,
            assignments: [...intern.assignments, assignment],
          };
        }
        return intern;
      });
      internsStore.set(updated);
    }
  };

  const deleteAssignment = (internId: string, assignmentId: string) => {
    const current = internsStore.getSnapshot();
    const updated = current.map((intern) => {
      if (intern.id === internId) {
        return {
          ...intern,
          assignments: intern.assignments.filter((a) => a.id !== assignmentId),
        };
      }
      return intern;
    });
    internsStore.set(updated);
  };

  return {
    interns,
    isLoaded,
    addIntern,
    updateIntern,
    deleteIntern,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  };
}
