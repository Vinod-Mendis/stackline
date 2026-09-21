import test from "node:test";
import assert from "node:assert/strict";
import {
  getAssignmentBarTop,
  getInternRowHeight,
  packAssignmentsIntoLanes,
} from "./lanes";
import { DateSpan } from "../types";

test("lanes: empty items returns 1 lane and empty list", () => {
  const result = packAssignmentsIntoLanes([]);
  assert.equal(result.totalLanes, 1);
  assert.equal(result.items.length, 0);
});

test("lanes: non-overlapping items share a single lane", () => {
  const items: (DateSpan & { id: string })[] = [
    { id: "1", startDate: "2026-09-01", endDate: "2026-09-05" },
    { id: "2", startDate: "2026-09-06", endDate: "2026-09-10" },
    { id: "3", startDate: "2026-09-15", endDate: "2026-09-20" },
  ];

  const result = packAssignmentsIntoLanes(items);
  assert.equal(result.totalLanes, 1);
  assert.equal(result.items[0].laneIndex, 0);
  assert.equal(result.items[1].laneIndex, 0);
  assert.equal(result.items[2].laneIndex, 0);
});

test("lanes: touching dates overlap because end dates are inclusive", () => {
  // Item 1 ends on 2026-09-05, Item 2 starts on 2026-09-05 -> overlap on 2026-09-05!
  const items: (DateSpan & { id: string })[] = [
    { id: "1", startDate: "2026-09-01", endDate: "2026-09-05" },
    { id: "2", startDate: "2026-09-05", endDate: "2026-09-10" },
  ];

  const result = packAssignmentsIntoLanes(items);
  assert.equal(result.totalLanes, 2);
  assert.notEqual(result.items[0].laneIndex, result.items[1].laneIndex);
});

test("lanes: overlapping items are packed into minimum necessary lanes without collision", () => {
  const items: (DateSpan & { id: string })[] = [
    { id: "a", startDate: "2026-09-01", endDate: "2026-09-15" },
    { id: "b", startDate: "2026-09-05", endDate: "2026-09-20" }, // overlaps with a -> lane 1
    { id: "c", startDate: "2026-09-16", endDate: "2026-09-25" }, // starts after a ends -> can reuse lane 0
    { id: "d", startDate: "2026-09-18", endDate: "2026-09-22" }, // overlaps with b and c -> lane 2
  ];

  const result = packAssignmentsIntoLanes(items);
  assert.equal(result.totalLanes, 3);

  // Check no two items in the same lane overlap
  const lanes = new Map<number, (DateSpan & { id: string })[]>();
  for (const item of result.items) {
    if (!lanes.has(item.laneIndex)) {
      lanes.set(item.laneIndex, []);
    }
    lanes.get(item.laneIndex)!.push(item);
  }

  for (const [, laneItems] of lanes) {
    laneItems.sort((x, y) => x.startDate.localeCompare(y.startDate));
    for (let i = 0; i < laneItems.length - 1; i++) {
      assert.ok(
        laneItems[i + 1].startDate > laneItems[i].endDate,
        `Collision detected in lane between ${laneItems[i].id} and ${laneItems[i + 1].id}`
      );
    }
  }
});

test("lanes: getInternRowHeight and getAssignmentBarTop follow required rules", () => {
  assert.equal(getInternRowHeight(1), 66); // 22 + 1 * 44 = 66
  assert.equal(getInternRowHeight(2), 110); // 22 + 2 * 44 = 110
  assert.equal(getInternRowHeight(3), 154); // 22 + 3 * 44 = 154
  assert.equal(getInternRowHeight(0), 66); // minimum 66

  assert.equal(getAssignmentBarTop(0), 14); // 14 + 0 * 44 = 14
  assert.equal(getAssignmentBarTop(1), 58); // 14 + 1 * 44 = 58
  assert.equal(getAssignmentBarTop(2), 102); // 14 + 2 * 44 = 102
});
