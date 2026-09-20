export const PHASE_COLORS = [
  "#A8620A",
  "#6D4CC2",
  "#0E7C6B",
  "#2A62B5",
  "#C2413B",
  "#5B6B7A",
] as const;

export type PhaseColor = (typeof PHASE_COLORS)[number];

export type PhaseUnit = "days" | "weeks";

export interface Phase {
  id: string;
  name: string; // free text, user-defined
  amount: number; // integer, at least 1
  unit: PhaseUnit; // "days" | "weeks"
  color: PhaseColor;
}

export interface Project {
  id: string;
  name: string;
  startDate: string; // "YYYY-MM-DD"
  phases: Phase[];
}

export interface ScheduledPhase extends Phase {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD" (inclusive)
  durationDays: number;
  dayOffset: number; // measured from timeline range start
}

export interface ScheduledProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  phases: ScheduledPhase[];
}

export interface TimelineDay {
  date: string; // "YYYY-MM-DD"
  dayOfMonth: number;
  weekdayInitial: string; // "M", "T", "W", "T", "F", "S", "S"
  isWeekend: boolean;
  isMonday: boolean;
  isToday: boolean;
  dayIndex: number;
}

export interface TimelineMonthGroup {
  label: string; // e.g. "Sep 2026"
  year: number;
  month: number; // 0-11
  dayCount: number;
  startIndex: number;
}

export interface TimelineRange {
  startDate: string; // "YYYY-MM-DD" (guaranteed Monday)
  endDate: string; // "YYYY-MM-DD"
  days: TimelineDay[];
  months: TimelineMonthGroup[];
  totalDays: number;
  todayIndex: number;
}
