"use client";

import { useSyncExternalStore } from "react";
import {
  Assignment,
  Category,
  Intern,
  PHASE_COLORS,
  PhaseColor,
  Project,
} from "../types";
import {
  addDaysUTC,
  getMondayOfWeekUTC,
  getTodayDateString,
  isValidDateString,
} from "./dates";
import { migrateProjects } from "./migrate";

const PROJECTS_STORAGE_KEY = "stackline_v1_projects";
const PROJECT_TYPES_STORAGE_KEY = "stackline_v1_project_types";
const ASSIGNMENT_KINDS_STORAGE_KEY = "stackline_v1_assignment_kinds";
const INTERNS_STORAGE_KEY = "stackline_v1_interns";

// ---------------------------------------------------------------------------
// Seed Creators
// ---------------------------------------------------------------------------

export function getSeedProjectTypes(): Category[] {
  return [
    { id: "cat-event", name: "Event", color: PHASE_COLORS[0] }, // #A8620A
    { id: "cat-web", name: "Web", color: PHASE_COLORS[3] }, // #2A62B5
    { id: "cat-product", name: "Product", color: PHASE_COLORS[2] }, // #0E7C6B
  ];
}

export function getSeedAssignmentKinds(): Category[] {
  return [
    { id: "kind-client", name: "Client project", color: PHASE_COLORS[3] }, // #2A62B5
    { id: "kind-learning", name: "Learning", color: PHASE_COLORS[1] }, // #6D4CC2
  ];
}

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
      typeId: "cat-event",
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
      typeId: "cat-product",
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
 * Creates dynamic seed interns with realistic titles and overlapping assignments.
 */
export function getSeedInterns(): Intern[] {
  const today = getTodayDateString();
  const thisMonday = getMondayOfWeekUTC(today);

  return [
    {
      id: "seed-intern-1",
      name: "Alex Rivera",
      assignments: [
        {
          id: "asg-1-1",
          title: "Mobile App Wireframes",
          kindId: "kind-client",
          startDate: addDaysUTC(thisMonday, -7),
          endDate: addDaysUTC(thisMonday, 7),
        },
        {
          id: "asg-1-2",
          title: "TypeScript Deep Dive",
          kindId: "kind-learning",
          startDate: addDaysUTC(thisMonday, 3), // Overlaps with asg-1-1 -> Lane 2
          endDate: addDaysUTC(thisMonday, 14),
        },
      ],
    },
    {
      id: "seed-intern-2",
      name: "Sam Chen",
      assignments: [
        {
          id: "asg-2-1",
          title: "Design System Audit",
          kindId: "kind-client",
          startDate: addDaysUTC(thisMonday, -14),
          endDate: addDaysUTC(thisMonday, -1),
        },
        {
          id: "asg-2-2",
          title: "User Research Synthesis",
          kindId: "kind-client",
          startDate: thisMonday,
          endDate: addDaysUTC(thisMonday, 12),
        },
      ],
    },
    {
      id: "seed-intern-3",
      name: "Jordan Taylor",
      assignments: [
        {
          id: "asg-3-1",
          title: "Next.js & React 19 Workshop",
          kindId: "kind-learning",
          startDate: addDaysUTC(thisMonday, -3),
          endDate: addDaysUTC(thisMonday, 4),
        },
        {
          id: "asg-3-2",
          title: "Landing Page Polish",
          kindId: "kind-client",
          startDate: addDaysUTC(thisMonday, 7),
          endDate: addDaysUTC(thisMonday, 18),
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

export function validateCategories(data: unknown): data is Category[] {
  if (!Array.isArray(data)) return false;
  for (const item of data) {
    if (!item || typeof item !== "object") return false;
    const cat = item as Record<string, unknown>;
    if (typeof cat.id !== "string" || !cat.id.trim()) return false;
    if (typeof cat.name !== "string" || !cat.name.trim()) return false;
    if (
      typeof cat.color !== "string" ||
      !PHASE_COLORS.includes(cat.color as PhaseColor)
    ) {
      return false;
    }
  }
  return true;
}

export function validateProjects(data: unknown): data is Project[] {
  if (!Array.isArray(data)) return false;

  for (const item of data) {
    if (!item || typeof item !== "object") return false;
    const p = item as Record<string, unknown>;
    if (typeof p.id !== "string" || !p.id.trim()) return false;
    if (typeof p.name !== "string") return false;
    if (!isValidDateString(p.startDate)) return false;
    if (p.typeId !== undefined && typeof p.typeId !== "string") return false;
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

export function validateInterns(data: unknown): data is Intern[] {
  if (!Array.isArray(data)) return false;

  for (const item of data) {
    if (!item || typeof item !== "object") return false;
    const intern = item as Record<string, unknown>;
    if (typeof intern.id !== "string" || !intern.id.trim()) return false;
    if (typeof intern.name !== "string") return false;
    if (!Array.isArray(intern.assignments)) return false;

    for (const asg of intern.assignments) {
      if (!asg || typeof asg !== "object") return false;
      const assignment = asg as Record<string, unknown>;
      if (typeof assignment.id !== "string" || !assignment.id.trim())
        return false;
      if (typeof assignment.title !== "string") return false;
      if (typeof assignment.kindId !== "string" || !assignment.kindId.trim())
        return false;
      if (!isValidDateString(assignment.startDate)) return false;
      if (!isValidDateString(assignment.endDate)) return false;
      if (assignment.endDate < assignment.startDate) return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Storage Helpers (Read seed without writing until first mutation)
// ---------------------------------------------------------------------------

function loadFromStorage<T>(
  key: string,
  validator: (data: unknown) => data is T,
  seedFn: () => T,
  migrator?: (data: unknown) => T
): T {
  if (typeof window === "undefined") {
    return seedFn();
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      // Return seed data without writing to localStorage until first mutation
      return seedFn();
    }
    const parsed: unknown = JSON.parse(raw);
    if (migrator) {
      const migrated = migrator(parsed);
      if (validator(migrated)) {
        return migrated;
      }
    } else if (validator(parsed)) {
      return parsed;
    }
    return seedFn();
  } catch {
    return seedFn();
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
}

// ---------------------------------------------------------------------------
// Project Store
// ---------------------------------------------------------------------------

let projectListeners: Array<() => void> = [];
let cachedProjects: Project[] | null = null;

function emitProjectsChange() {
  for (const listener of projectListeners) {
    listener();
  }
}

const EMPTY_PROJECTS: Project[] = [];

export const projectStore = {
  subscribe(listener: () => void) {
    projectListeners = [...projectListeners, listener];
    return () => {
      projectListeners = projectListeners.filter((l) => l !== listener);
    };
  },
  getSnapshot(): Project[] {
    if (cachedProjects === null) {
      cachedProjects = loadFromStorage(
        PROJECTS_STORAGE_KEY,
        validateProjects,
        getSeedProjects,
        migrateProjects
      );
    }
    return cachedProjects;
  },
  getServerSnapshot(): Project[] {
    return EMPTY_PROJECTS;
  },
  setProjects(updated: Project[]) {
    cachedProjects = updated;
    saveToStorage(PROJECTS_STORAGE_KEY, updated);
    emitProjectsChange();
  },
};

// ---------------------------------------------------------------------------
// Project Types Store
// ---------------------------------------------------------------------------

let projectTypesListeners: Array<() => void> = [];
let cachedProjectTypes: Category[] | null = null;

function emitProjectTypesChange() {
  for (const listener of projectTypesListeners) {
    listener();
  }
}

const EMPTY_CATEGORIES: Category[] = [];

export const projectTypesStore = {
  subscribe(listener: () => void) {
    projectTypesListeners = [...projectTypesListeners, listener];
    return () => {
      projectTypesListeners = projectTypesListeners.filter(
        (l) => l !== listener
      );
    };
  },
  getSnapshot(): Category[] {
    if (cachedProjectTypes === null) {
      cachedProjectTypes = loadFromStorage(
        PROJECT_TYPES_STORAGE_KEY,
        validateCategories,
        getSeedProjectTypes
      );
    }
    return cachedProjectTypes;
  },
  getServerSnapshot(): Category[] {
    return EMPTY_CATEGORIES;
  },
  setCategories(updated: Category[]) {
    cachedProjectTypes = updated;
    saveToStorage(PROJECT_TYPES_STORAGE_KEY, updated);
    emitProjectTypesChange();
  },
};

// ---------------------------------------------------------------------------
// Assignment Kinds Store
// ---------------------------------------------------------------------------

let assignmentKindsListeners: Array<() => void> = [];
let cachedAssignmentKinds: Category[] | null = null;

function emitAssignmentKindsChange() {
  for (const listener of assignmentKindsListeners) {
    listener();
  }
}

export const assignmentKindsStore = {
  subscribe(listener: () => void) {
    assignmentKindsListeners = [...assignmentKindsListeners, listener];
    return () => {
      assignmentKindsListeners = assignmentKindsListeners.filter(
        (l) => l !== listener
      );
    };
  },
  getSnapshot(): Category[] {
    if (cachedAssignmentKinds === null) {
      cachedAssignmentKinds = loadFromStorage(
        ASSIGNMENT_KINDS_STORAGE_KEY,
        validateCategories,
        getSeedAssignmentKinds
      );
    }
    return cachedAssignmentKinds;
  },
  getServerSnapshot(): Category[] {
    return EMPTY_CATEGORIES;
  },
  setCategories(updated: Category[]) {
    cachedAssignmentKinds = updated;
    saveToStorage(ASSIGNMENT_KINDS_STORAGE_KEY, updated);
    emitAssignmentKindsChange();
  },
};

// ---------------------------------------------------------------------------
// Interns Store
// ---------------------------------------------------------------------------

let internsListeners: Array<() => void> = [];
let cachedInterns: Intern[] | null = null;

function emitInternsChange() {
  for (const listener of internsListeners) {
    listener();
  }
}

const EMPTY_INTERNS: Intern[] = [];

export const internsStore = {
  subscribe(listener: () => void) {
    internsListeners = [...internsListeners, listener];
    return () => {
      internsListeners = internsListeners.filter((l) => l !== listener);
    };
  },
  getSnapshot(): Intern[] {
    if (cachedInterns === null) {
      cachedInterns = loadFromStorage(
        INTERNS_STORAGE_KEY,
        validateInterns,
        getSeedInterns
      );
    }
    return cachedInterns;
  },
  getServerSnapshot(): Intern[] {
    return EMPTY_INTERNS;
  },
  setInterns(updated: Intern[]) {
    cachedInterns = updated;
    saveToStorage(INTERNS_STORAGE_KEY, updated);
    emitInternsChange();
  },
};

// ---------------------------------------------------------------------------
// Custom Hooks
// ---------------------------------------------------------------------------

const emptySubscribe = () => () => {};
const getClientLoadedSnapshot = () => true;
const getServerLoadedSnapshot = () => false;

export function useIsLoaded() {
  return useSyncExternalStore(
    emptySubscribe,
    getClientLoadedSnapshot,
    getServerLoadedSnapshot
  );
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
    projectTypesStore.setCategories(updated);
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
    assignmentKindsStore.setCategories(updated);
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
    internsStore.setInterns([...current, newIntern]);
    return id;
  };

  const updateIntern = (internId: string, name: string) => {
    const current = internsStore.getSnapshot();
    const updated = current.map((i) =>
      i.id === internId ? { ...i, name: name.trim() || "Untitled intern" } : i
    );
    internsStore.setInterns(updated);
  };

  const deleteIntern = (internId: string) => {
    const current = internsStore.getSnapshot();
    const updated = current.filter((i) => i.id !== internId);
    internsStore.setInterns(updated);
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
    internsStore.setInterns(updated);
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
      internsStore.setInterns(updated);
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
      internsStore.setInterns(updated);
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
    internsStore.setInterns(updated);
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
