"use client";

import { useSyncExternalStore } from "react";
import { PhaseColor, PHASE_COLORS, Project } from "../types";
import { addDaysUTC, getMondayOfWeekUTC, getTodayDateString, isValidDateString } from "./dates";

const STORAGE_KEY = "stackline_v1_projects";

/**
 * Creates dynamic seed projects relative to today:
 * Project 1 starts: this week's Monday - 7 days
 * Project 2 starts: this week's Monday + 14 days
 */
export function getSeedProjects(): Project[] {
  const today = getTodayDateString();
  const thisMonday = getMondayOfWeekUTC(today);
  const proj1Start = addDaysUTC(thisMonday, -7);
  const proj2Start = addDaysUTC(thisMonday, 14);

  return [
    {
      id: "seed-project-1",
      name: "Brand identity refresh",
      startDate: proj1Start,
      phases: [
        {
          id: "p1-phase-1",
          name: "Client research",
          amount: 1,
          unit: "weeks",
          color: PHASE_COLORS[0],
        },
        {
          id: "p1-phase-2",
          name: "Wireframes",
          amount: 2,
          unit: "weeks",
          color: PHASE_COLORS[1],
        },
        {
          id: "p1-phase-3",
          name: "Build",
          amount: 3,
          unit: "weeks",
          color: PHASE_COLORS[3],
        },
        {
          id: "p1-phase-4",
          name: "QA and fixes",
          amount: 5,
          unit: "days",
          color: PHASE_COLORS[2],
        },
      ],
    },
    {
      id: "seed-project-2",
      name: "Mobile app onboarding",
      startDate: proj2Start,
      phases: [
        {
          id: "p2-phase-1",
          name: "User interviews",
          amount: 10,
          unit: "days",
          color: PHASE_COLORS[4],
        },
        {
          id: "p2-phase-2",
          name: "Flow prototypes",
          amount: 2,
          unit: "weeks",
          color: PHASE_COLORS[5],
        },
        {
          id: "p2-phase-3",
          name: "Design review",
          amount: 4,
          unit: "days",
          color: PHASE_COLORS[0],
        },
      ],
    },
  ];
}

/**
 * Validates the parsed structure of projects and phases from localStorage.
 */
export function validateProjects(data: unknown): data is Project[] {
  if (!Array.isArray(data)) return false;

  for (const item of data) {
    if (!item || typeof item !== "object") return false;
    const p = item as Record<string, unknown>;
    if (typeof p.id !== "string" || !p.id.trim()) return false;
    if (typeof p.name !== "string") return false;
    if (!isValidDateString(p.startDate)) return false;
    if (!Array.isArray(p.phases)) return false;

    for (const ph of p.phases) {
      if (!ph || typeof ph !== "object") return false;
      const phase = ph as Record<string, unknown>;
      if (typeof phase.id !== "string" || !phase.id.trim()) return false;
      if (typeof phase.name !== "string") return false;
      if (
        typeof phase.amount !== "number" ||
        phase.amount < 1 ||
        !Number.isInteger(phase.amount)
      ) {
        return false;
      }
      if (phase.unit !== "days" && phase.unit !== "weeks") return false;
      if (
        typeof phase.color !== "string" ||
        !PHASE_COLORS.includes(phase.color as PhaseColor)
      ) {
        return false;
      }
    }
  }

  return true;
}

export function loadStoredProjects(): Project[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = getSeedProjects();
      saveStoredProjects(seed);
      return seed;
    }
    const parsed: unknown = JSON.parse(raw);
    if (validateProjects(parsed)) {
      return parsed;
    }
    // Corrupt or invalid schema -> fall back to seed
    const seed = getSeedProjects();
    saveStoredProjects(seed);
    return seed;
  } catch {
    const seed = getSeedProjects();
    return seed;
  }
}

export function saveStoredProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to save projects to localStorage:", error);
  }
}

// In-memory cache and subscribers for useSyncExternalStore
let listeners: Array<() => void> = [];
let cachedProjects: Project[] | null = null;

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

const EMPTY_PROJECTS: Project[] = [];

export const projectStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot(): Project[] {
    if (cachedProjects === null) {
      cachedProjects = loadStoredProjects();
    }
    return cachedProjects;
  },
  getServerSnapshot(): Project[] {
    return EMPTY_PROJECTS;
  },
  setProjects(updated: Project[]) {
    cachedProjects = updated;
    saveStoredProjects(updated);
    emitChange();
  },
};

const emptySubscribe = () => () => {};
const getClientLoadedSnapshot = () => true;
const getServerLoadedSnapshot = () => false;

export function useProjectStore() {
  const projects = useSyncExternalStore(
    projectStore.subscribe,
    projectStore.getSnapshot,
    projectStore.getServerSnapshot
  );

  const isLoaded = useSyncExternalStore(
    emptySubscribe,
    getClientLoadedSnapshot,
    getServerLoadedSnapshot
  );

  const addProject = (project: Project) => {
    const current = projectStore.getSnapshot();
    const updated = [...current, project];
    projectStore.setProjects(updated);
  };

  const updateProject = (project: Project) => {
    const current = projectStore.getSnapshot();
    const updated = current.map((p) => (p.id === project.id ? project : p));
    projectStore.setProjects(updated);
  };

  const deleteProject = (projectId: string) => {
    const current = projectStore.getSnapshot();
    const updated = current.filter((p) => p.id !== projectId);
    projectStore.setProjects(updated);
  };

  return {
    projects,
    isLoaded,
    addProject,
    updateProject,
    deleteProject,
  };
}
