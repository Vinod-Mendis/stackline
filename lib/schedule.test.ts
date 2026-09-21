import test from "node:test";
import assert from "node:assert/strict";
import {
  addDaysUTC,
  diffDaysUTC,
  formatDateRange,
  formatDuration,
  getMondayOfWeekUTC,
  getTodayDateString,
  getWeekdayInitialUTC,
  isMondayUTC,
  isWeekendUTC,
  isValidDateString,
  parseDateUTC,
} from "./dates";
import {
  computeTimelineRange,
  computeTimelineRangeFromSpans,
  scheduleIntern,
  scheduleProject,
} from "./schedule";
import { getSeedProjects, validateProjects } from "./store";
import { Project } from "../types";

test("dates: parseDateUTC and addDaysUTC handle month and leap year boundaries correctly", () => {
  const d1 = "2024-02-28";
  const d2 = addDaysUTC(d1, 1);
  assert.equal(d2, "2024-02-29"); // leap year

  const d3 = addDaysUTC(d2, 1);
  assert.equal(d3, "2024-03-01");

  const dYearEnd = "2026-12-31";
  assert.equal(addDaysUTC(dYearEnd, 1), "2027-01-01");
});

test("dates: diffDaysUTC computes exact whole days in UTC", () => {
  assert.equal(diffDaysUTC("2026-09-01", "2026-09-01"), 0);
  assert.equal(diffDaysUTC("2026-09-01", "2026-09-02"), 1);
  assert.equal(diffDaysUTC("2026-09-01", "2026-09-08"), 7);
  assert.equal(diffDaysUTC("2026-09-08", "2026-09-01"), -7);
});

test("dates: getMondayOfWeekUTC returns the Monday of the current week", () => {
  // 2026-09-20 is Sunday
  assert.equal(getMondayOfWeekUTC("2026-09-20"), "2026-09-14");
  // 2026-09-21 is Monday
  assert.equal(getMondayOfWeekUTC("2026-09-21"), "2026-09-21");
  // 2026-09-23 is Wednesday
  assert.equal(getMondayOfWeekUTC("2026-09-23"), "2026-09-21");
});

test("dates: getWeekdayInitialUTC, isWeekendUTC, isMondayUTC return correct calendar data", () => {
  // 2026-09-21 is Monday
  assert.equal(getWeekdayInitialUTC("2026-09-21"), "M");
  assert.equal(isMondayUTC("2026-09-21"), true);
  assert.equal(isWeekendUTC("2026-09-21"), false);

  // 2026-09-26 is Saturday
  assert.equal(getWeekdayInitialUTC("2026-09-26"), "S");
  assert.equal(isWeekendUTC("2026-09-26"), true);
  assert.equal(isMondayUTC("2026-09-26"), false);

  // 2026-09-27 is Sunday
  assert.equal(getWeekdayInitialUTC("2026-09-27"), "S");
  assert.equal(isWeekendUTC("2026-09-27"), true);
});

test("dates: getTodayDateString uses local date parts format YYYY-MM-DD", () => {
  const today = getTodayDateString();
  assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(isValidDateString(today), true);
});

test("dates: formatDuration and formatDateRange", () => {
  assert.equal(formatDuration(1, "days"), "1 day");
  assert.equal(formatDuration(3, "days"), "3 days");
  assert.equal(formatDuration(1, "weeks"), "1 week");
  assert.equal(formatDuration(2, "weeks"), "2 weeks");

  assert.equal(formatDateRange("2026-09-01", "2026-09-14"), "Sep 1 – 14, 2026");
  assert.equal(formatDateRange("2026-09-28", "2026-10-05"), "Sep 28 – Oct 5, 2026");
});

test("schedule: scheduleProject runs phases back to back with inclusive end dates", () => {
  const project: Project = {
    id: "test-proj-1",
    name: "Design Sprint",
    startDate: "2026-09-01",
    phases: [
      {
        id: "p1",
        name: "Research",
        amount: 3,
        unit: "days",
        color: "#A8620A",
      },
      {
        id: "p2",
        name: "Prototyping",
        amount: 1,
        unit: "weeks", // 7 days
        color: "#6D4CC2",
      },
      {
        id: "p3",
        name: "Testing",
        amount: 2,
        unit: "days",
        color: "#0E7C6B",
      },
    ],
  };

  // Phase 1: starts 2026-09-01, 3 days inclusive -> ends 2026-09-03
  // Phase 2: starts day after (2026-09-04), 7 days inclusive -> ends 2026-09-10
  // Phase 3: starts day after (2026-09-11), 2 days inclusive -> ends 2026-09-12
  // Total days = 3 + 7 + 2 = 12 days

  const scheduled = scheduleProject(project, "2026-08-24");

  assert.equal(scheduled.phases.length, 3);

  assert.equal(scheduled.phases[0].startDate, "2026-09-01");
  assert.equal(scheduled.phases[0].endDate, "2026-09-03");
  assert.equal(scheduled.phases[0].durationDays, 3);
  assert.equal(scheduled.phases[0].dayOffset, diffDaysUTC("2026-08-24", "2026-09-01"));

  assert.equal(scheduled.phases[1].startDate, "2026-09-04");
  assert.equal(scheduled.phases[1].endDate, "2026-09-10");
  assert.equal(scheduled.phases[1].durationDays, 7);
  assert.equal(scheduled.phases[1].dayOffset, diffDaysUTC("2026-08-24", "2026-09-04"));

  assert.equal(scheduled.phases[2].startDate, "2026-09-11");
  assert.equal(scheduled.phases[2].endDate, "2026-09-12");
  assert.equal(scheduled.phases[2].durationDays, 2);
  assert.equal(scheduled.phases[2].dayOffset, diffDaysUTC("2026-08-24", "2026-09-11"));

  assert.equal(scheduled.totalDays, 12);
  assert.equal(scheduled.endDate, "2026-09-12");
});

test("schedule: computeTimelineRange meets all axis rules", () => {
  const today = "2026-09-20";
  const projects: Project[] = [
    {
      id: "p1",
      name: "Project A",
      startDate: "2026-09-15",
      phases: [
        {
          id: "ph1",
          name: "Sprint 1",
          amount: 2,
          unit: "weeks",
          color: "#A8620A",
        },
      ],
    },
  ];

  const { range, scheduledProjects } = computeTimelineRange(projects, today);

  // 1. Must start on a Monday
  assert.equal(parseDateUTC(range.startDate).getUTCDay(), 1);

  // 2. Must end on a Sunday
  assert.equal(parseDateUTC(range.endDate).getUTCDay(), 0);

  // 3. Must span at least 8 weeks (56 days)
  assert.ok(range.totalDays >= 56);
  assert.equal(range.totalDays % 7, 0); // whole weeks

  // 4. Must start at or before Monday 1 week before min(earliest start, today)
  // earliest start is 2026-09-15. Today is 2026-09-20.
  // min is 2026-09-15. Monday of 2026-09-15 is 2026-09-14.
  // One week before is 2026-09-07.
  assert.equal(range.startDate, "2026-09-07");

  // 5. Scheduled project dayOffset aligns with range start
  assert.equal(
    scheduledProjects[0].phases[0].dayOffset,
    diffDaysUTC(range.startDate, "2026-09-15")
  );

  // 6. Today index is located in range
  assert.equal(range.days[range.todayIndex].date, today);
});

test("store: seed projects are dynamic and valid", () => {
  const seed = getSeedProjects();
  assert.equal(seed.length, 2);
  assert.equal(validateProjects(seed), true);

  // Test invalid schema rejection
  assert.equal(validateProjects(null), false);
  assert.equal(validateProjects([{ id: "1" }]), false);
  assert.equal(
    validateProjects([
      {
        id: "1",
        name: "Test",
        startDate: "not-a-date",
        phases: [],
      },
    ]),
    false
  );
  assert.equal(
    validateProjects([
      {
        id: "1",
        name: "Test",
        startDate: "2026-09-01",
        phases: [
          {
            id: "p1",
            name: "Phase",
            amount: 0, // invalid amount
            unit: "days",
            color: "#A8620A",
          },
        ],
      },
    ]),
    false
  );
});

test("schedule: computeTimelineRangeFromSpans correctly bounds generic date spans", () => {
  const spans = [
    { startDate: "2026-09-10", endDate: "2026-09-18" },
    { startDate: "2026-09-25", endDate: "2026-10-02" },
  ];
  const today = "2026-09-15";

  const range = computeTimelineRangeFromSpans(spans, today);

  // Range starts on Monday
  assert.equal(parseDateUTC(range.startDate).getUTCDay(), 1);
  // Range ends on Sunday
  assert.equal(parseDateUTC(range.endDate).getUTCDay(), 0);
  // Earliest date is 2026-09-10 (Thursday). Monday of that week is 2026-09-07. One week before is 2026-08-31.
  assert.equal(range.startDate, "2026-08-31");
  // Range has at least 56 days
  assert.ok(range.totalDays >= 56);
  assert.ok(range.todayIndex >= 0);
});

test("schedule: scheduleIntern places assignments in lanes and computes active today count", () => {
  const today = "2026-09-15";
  const intern = {
    id: "intern-1",
    name: "Alex",
    assignments: [
      {
        id: "a1",
        title: "Client task",
        kindId: "kind-client",
        startDate: "2026-09-10",
        endDate: "2026-09-18", // covers today (2026-09-15)
      },
      {
        id: "a2",
        title: "Study task",
        kindId: "kind-learn",
        startDate: "2026-09-14", // overlaps with a1 -> lane 1
        endDate: "2026-09-20", // covers today (2026-09-15)
      },
      {
        id: "a3",
        title: "Future task",
        kindId: "kind-learn",
        startDate: "2026-09-25",
        endDate: "2026-09-30", // does not cover today
      },
    ],
  };

  const scheduled = scheduleIntern(intern, "2026-08-31", today);
  assert.equal(scheduled.id, "intern-1");
  assert.equal(scheduled.totalLanes, 2);
  assert.equal(scheduled.activeTodayCount, 2);
  assert.equal(scheduled.assignments.length, 3);
  assert.equal(scheduled.assignments[0].durationDays, 9); // 10th to 18th inclusive = 9 days
});

