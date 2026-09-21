import { Phase, PHASE_COLORS, PhaseColor, Project } from "../types";
import { isValidDateString } from "./dates";

/**
 * Validates and migrates stored project payloads.
 * - Safely handles legacy records where typeId is missing or invalid.
 * - If validCategoryIds is provided, strips typeIds that do not exist in the known category set.
 * - Never throws; gracefully skips corrupted items.
 */
export function migrateProjects(
  data: unknown,
  validCategoryIds?: Set<string>
): Project[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const migrated: Project[] = [];

  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const p = item as Record<string, unknown>;

    if (typeof p.id !== "string" || !p.id.trim()) continue;
    if (typeof p.name !== "string") continue;
    if (!isValidDateString(p.startDate)) continue;
    if (!Array.isArray(p.phases)) continue;

    const validPhases: Phase[] = [];
    for (const ph of p.phases) {
      if (!ph || typeof ph !== "object") continue;
      const phase = ph as Record<string, unknown>;

      if (typeof phase.id !== "string" || !phase.id.trim()) continue;
      if (typeof phase.name !== "string") continue;
      if (
        typeof phase.amount !== "number" ||
        phase.amount < 1 ||
        !Number.isInteger(phase.amount)
      ) {
        continue;
      }
      if (phase.unit !== "days" && phase.unit !== "weeks") continue;
      if (
        typeof phase.color !== "string" ||
        !PHASE_COLORS.includes(phase.color as PhaseColor)
      ) {
        continue;
      }

      validPhases.push({
        id: phase.id,
        name: phase.name,
        amount: phase.amount,
        unit: phase.unit,
        color: phase.color as PhaseColor,
      });
    }

    // Resolve typeId: if missing or invalid, or not in known categories, treat as undefined
    let resolvedTypeId: string | undefined = undefined;
    if (typeof p.typeId === "string" && p.typeId.trim()) {
      if (!validCategoryIds || validCategoryIds.has(p.typeId.trim())) {
        resolvedTypeId = p.typeId.trim();
      }
    }

    migrated.push({
      id: p.id.trim(),
      name: p.name,
      startDate: p.startDate,
      typeId: resolvedTypeId,
      phases: validPhases,
    });
  }

  return migrated;
}
