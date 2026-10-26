import {
  validateCategories,
  validateInterns,
  validateProjects,
} from "./validate";

// One document per key in the "state" collection: { _id: key, data: [...] }
export const STATE_VALIDATORS = {
  projects: validateProjects,
  projectTypes: validateCategories,
  assignmentKinds: validateCategories,
  interns: validateInterns,
} as const;

export type StateKey = keyof typeof STATE_VALIDATORS;

export const STATE_KEYS = Object.keys(STATE_VALIDATORS) as StateKey[];

export function isStateKey(key: string): key is StateKey {
  return key in STATE_VALIDATORS;
}
