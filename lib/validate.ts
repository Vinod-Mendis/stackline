import { Category, Intern, PHASE_COLORS, PhaseColor, Project } from "../types";
import { isValidDateString } from "./dates";

// Pure validators shared by the API routes (server) and the client store.

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
