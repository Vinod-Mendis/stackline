import { DateSpan } from "../types";

export interface LanePacked<T> {
  item: T;
  laneIndex: number;
}

export interface LanePackingResult<T> {
  items: (T & { laneIndex: number })[];
  totalLanes: number;
}

/**
 * Returns dynamic intern row height based on user rule:
 * getInternRowHeight = 22 + totalLanes * 44 (66 for one lane)
 */
export function getInternRowHeight(totalLanes: number): number {
  const lanes = Math.max(1, totalLanes);
  return 22 + lanes * 44;
}

/**
 * Returns vertical pixel top offset for an assignment bar at laneIndex.
 * Default: 14 + laneIndex * 44
 */
export function getAssignmentBarTop(laneIndex: number): number {
  return 14 + laneIndex * 44;
}

/**
 * Pure lane packing algorithm.
 *
 * - End dates are inclusive ("YYYY-MM-DD").
 * - If item A ends on date D, an item starting on date D overlaps and must be in a different lane.
 * - An item starting strictly after date D (i.e. > D) can reuse the lane.
 * - Sorts items primarily by startDate ascending, secondarily by endDate ascending.
 * - Iterates through items and places each in the first available lane whose current lastEndDate < item.startDate.
 * - If no lane fits, allocates a new lane.
 * - Returns totalLanes (minimum 1) and each item tagged with its 0-based laneIndex.
 */
export function packAssignmentsIntoLanes<T extends DateSpan>(
  items: T[]
): LanePackingResult<T> {
  if (items.length === 0) {
    return {
      items: [],
      totalLanes: 1,
    };
  }

  // Sort by startDate asc, then endDate asc
  const indexed = items.map((item, originalIndex) => ({
    item,
    originalIndex,
  }));

  indexed.sort((a, b) => {
    if (a.item.startDate !== b.item.startDate) {
      return a.item.startDate.localeCompare(b.item.startDate);
    }
    return a.item.endDate.localeCompare(b.item.endDate);
  });

  // Track the inclusive last end date for each lane
  const laneLastEndDates: string[] = [];
  const resultsWithLane: { item: T; laneIndex: number; originalIndex: number }[] =
    [];

  for (const entry of indexed) {
    const { item, originalIndex } = entry;
    let placedLaneIndex = -1;

    for (let l = 0; l < laneLastEndDates.length; l++) {
      // Since end dates are inclusive, start date must be strictly greater than last end date
      if (item.startDate > laneLastEndDates[l]) {
        placedLaneIndex = l;
        laneLastEndDates[l] = item.endDate;
        break;
      }
    }

    if (placedLaneIndex === -1) {
      placedLaneIndex = laneLastEndDates.length;
      laneLastEndDates.push(item.endDate);
    }

    resultsWithLane.push({
      item,
      laneIndex: placedLaneIndex,
      originalIndex,
    });
  }

  // Restore original ordering
  resultsWithLane.sort((a, b) => a.originalIndex - b.originalIndex);

  return {
    items: resultsWithLane.map(({ item, laneIndex }) => ({
      ...item,
      laneIndex,
    })),
    totalLanes: Math.max(1, laneLastEndDates.length),
  };
}
