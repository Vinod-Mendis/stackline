import {
  Project,
  ScheduledPhase,
  ScheduledProject,
  TimelineDay,
  TimelineMonthGroup,
  TimelineRange,
} from "../types";
import {
  addDaysUTC,
  diffDaysUTC,
  formatMonthYearUTC,
  getMondayOfWeekUTC,
  getWeekdayInitialUTC,
  isMondayUTC,
  isWeekendUTC,
  parseDateUTC,
} from "./dates";

/**
 * Calculates scheduled phases for a project.
 * - Phases run back to back from the project start date.
 * - Each phase starts the day after the previous one ends.
 * - weeks = amount * 7 days.
 * - Phase end dates are inclusive.
 * - ScheduledPhase.dayOffset is measured from the timeline range start (or project start if timelineStartDate is omitted).
 */
export function scheduleProject(
  project: Project,
  timelineStartDate?: string
): ScheduledProject {
  const referenceStart = timelineStartDate ?? project.startDate;
  let currentStart = project.startDate;
  let totalDays = 0;
  const scheduledPhases: ScheduledPhase[] = [];

  for (const phase of project.phases) {
    const validAmount = Math.max(1, Math.floor(phase.amount) || 1);
    const durationDays = phase.unit === "weeks" ? validAmount * 7 : validAmount;
    const phaseStartDate = currentStart;
    const phaseEndDate = addDaysUTC(phaseStartDate, durationDays - 1);
    const dayOffset = diffDaysUTC(referenceStart, phaseStartDate);

    scheduledPhases.push({
      ...phase,
      amount: validAmount,
      startDate: phaseStartDate,
      endDate: phaseEndDate,
      durationDays,
      dayOffset,
    });

    totalDays += durationDays;
    // Next phase starts the day after the previous ends
    currentStart = addDaysUTC(phaseEndDate, 1);
  }

  const projectEndDate =
    scheduledPhases.length > 0
      ? scheduledPhases[scheduledPhases.length - 1].endDate
      : project.startDate;

  return {
    id: project.id,
    name: project.name,
    startDate: project.startDate,
    endDate: projectEndDate,
    totalDays,
    phases: scheduledPhases,
  };
}

/**
 * Computes the shared timeline axis range and schedules all projects against it.
 *
 * Rules:
 * - Axis range: from Monday 1 week before the earliest start (or today, whichever is earlier)
 *   to 2 weeks after the latest end, minimum 8 weeks.
 * - Grid starts on Monday and ends on Sunday for clean complete weeks.
 * - One column per calendar day, 36px wide.
 * - Header row 1: month labels spanning their days.
 * - Header row 2: weekday initial above date number.
 */
export function computeTimelineRange(
  projects: Project[],
  todayStr: string
): {
  range: TimelineRange;
  scheduledProjects: ScheduledProject[];
} {
  // 1. Gather all start dates and preliminary end dates to determine boundary
  const allStartDates: string[] = [todayStr];
  const allEndDates: string[] = [todayStr];

  for (const proj of projects) {
    if (proj.startDate) {
      allStartDates.push(proj.startDate);
      // Rough end date for boundary:
      let days = 0;
      for (const p of proj.phases) {
        const amt = Math.max(1, Math.floor(p.amount) || 1);
        days += p.unit === "weeks" ? amt * 7 : amt;
      }
      const projEnd = days > 0 ? addDaysUTC(proj.startDate, days - 1) : proj.startDate;
      allEndDates.push(projEnd);
    }
  }

  // Earliest start among projects and today
  allStartDates.sort();
  const earliestDate = allStartDates[0];

  // Monday one week before earliest start (or today, whichever is earlier)
  const mondayOfEarliest = getMondayOfWeekUTC(earliestDate);
  const axisStartDate = addDaysUTC(mondayOfEarliest, -7);

  // Latest end among projects and today
  allEndDates.sort();
  const latestDate = allEndDates[allEndDates.length - 1];

  // Two weeks after the latest end
  let axisEndDate = addDaysUTC(latestDate, 14);

  // Minimum 8 weeks (56 days)
  let totalDays = diffDaysUTC(axisStartDate, axisEndDate) + 1;
  if (totalDays < 56) {
    axisEndDate = addDaysUTC(axisStartDate, 55);
    totalDays = 56;
  }

  // Pad to full weeks ending on Sunday (day 0)
  const endDayOfWeek = parseDateUTC(axisEndDate).getUTCDay();
  if (endDayOfWeek !== 0) {
    const daysToAdd = 7 - endDayOfWeek;
    axisEndDate = addDaysUTC(axisEndDate, daysToAdd);
    totalDays = diffDaysUTC(axisStartDate, axisEndDate) + 1;
  }

  // 2. Generate each day in the timeline
  const days: TimelineDay[] = [];
  let todayIndex = -1;

  for (let i = 0; i < totalDays; i++) {
    const date = addDaysUTC(axisStartDate, i);
    const dateObj = parseDateUTC(date);
    const isToday = date === todayStr;

    if (isToday) {
      todayIndex = i;
    }

    days.push({
      date,
      dayOfMonth: dateObj.getUTCDate(),
      weekdayInitial: getWeekdayInitialUTC(date),
      isWeekend: isWeekendUTC(date),
      isMonday: isMondayUTC(date),
      isToday,
      dayIndex: i,
    });
  }

  // 3. Build month groups for header row 1
  const months: TimelineMonthGroup[] = [];
  let currentGroup: TimelineMonthGroup | null = null;

  for (let i = 0; i < days.length; i++) {
    const d = parseDateUTC(days[i].date);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();

    if (
      !currentGroup ||
      currentGroup.year !== year ||
      currentGroup.month !== month
    ) {
      if (currentGroup) {
        months.push(currentGroup);
      }
      currentGroup = {
        label: formatMonthYearUTC(days[i].date),
        year,
        month,
        dayCount: 1,
        startIndex: i,
      };
    } else {
      currentGroup.dayCount++;
    }
  }

  if (currentGroup) {
    months.push(currentGroup);
  }

  // 4. Schedule all projects relative to axisStartDate
  const scheduledProjects = projects.map((p) =>
    scheduleProject(p, axisStartDate)
  );

  return {
    range: {
      startDate: axisStartDate,
      endDate: axisEndDate,
      days,
      months,
      totalDays,
      todayIndex,
    },
    scheduledProjects,
  };
}
