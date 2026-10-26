export const PHASE_COLORS = [
  "#FF6B35",
  "#8B5CF6",
  "#12B886",
  "#2D9CFF",
  "#F43F5E",
  "#EC4899",
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

export interface Category {
  id: string;
  name: string; // e.g. "Event", "Web", "Product", "Client project", "Learning"
  color: PhaseColor;
}

export interface DateSpan {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD" (inclusive)
}

export interface Project {
  id: string;
  name: string;
  startDate: string; // "YYYY-MM-DD"
  typeId?: string; // optional reference to Category.id
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
  typeId?: string;
  totalDays: number;
  phases: ScheduledPhase[];
}

export interface Assignment {
  id: string;
  title: string;
  kindId: string; // reference to Category.id
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD" (inclusive)
}

export interface Intern {
  id: string;
  name: string;
  assignments: Assignment[];
}

export interface ScheduledAssignment extends Assignment {
  durationDays: number;
  dayOffset: number; // measured from timeline range start
  laneIndex: number; // 0-based lane index
}

export interface ScheduledIntern {
  id: string;
  name: string;
  assignments: ScheduledAssignment[];
  totalLanes: number;
  activeTodayCount: number;
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
