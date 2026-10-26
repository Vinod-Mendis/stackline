import test from "node:test";
import assert from "node:assert/strict";
import { migrateProjects } from "./migrate";

test("migrate: loads legacy projects without typeId intact with typeId undefined", () => {
  const legacyData = [
    {
      id: "legacy-proj-1",
      name: "Old Brand Refresh",
      startDate: "2026-09-01",
      phases: [
        {
          id: "ph-1",
          name: "Design",
          amount: 2,
          unit: "weeks",
          color: "#FF6B35",
        },
      ],
    },
  ];

  const migrated = migrateProjects(legacyData);
  assert.equal(migrated.length, 1);
  assert.equal(migrated[0].id, "legacy-proj-1");
  assert.equal(migrated[0].name, "Old Brand Refresh");
  assert.equal(migrated[0].typeId, undefined);
  assert.equal(migrated[0].phases.length, 1);
  assert.equal(migrated[0].phases[0].color, "#FF6B35");
});

test("migrate: preserves valid typeId when present", () => {
  const data = [
    {
      id: "p1",
      name: "Web Portal",
      startDate: "2026-09-01",
      typeId: "cat-web",
      phases: [
        {
          id: "ph-1",
          name: "Sprint 1",
          amount: 5,
          unit: "days",
          color: "#2D9CFF",
        },
      ],
    },
  ];

  const validCategories = new Set(["cat-web", "cat-event"]);
  const migrated = migrateProjects(data, validCategories);
  assert.equal(migrated.length, 1);
  assert.equal(migrated[0].typeId, "cat-web");
});

test("migrate: strips typeId if not in valid category set", () => {
  const data = [
    {
      id: "p1",
      name: "Web Portal",
      startDate: "2026-09-01",
      typeId: "cat-deleted",
      phases: [
        {
          id: "ph-1",
          name: "Sprint 1",
          amount: 5,
          unit: "days",
          color: "#2D9CFF",
        },
      ],
    },
  ];

  const validCategories = new Set(["cat-web", "cat-event"]);
  const migrated = migrateProjects(data, validCategories);
  assert.equal(migrated.length, 1);
  assert.equal(migrated[0].typeId, undefined);
});

test("migrate: ignores corrupt entries and handles non-array input safely", () => {
  assert.deepEqual(migrateProjects(null), []);
  assert.deepEqual(migrateProjects("not-json"), []);
  assert.deepEqual(migrateProjects({}), []);

  const mixedData = [
    null,
    { id: "missing-start-date", name: "Bad" },
    { id: "bad-date", name: "Bad", startDate: "invalid-date", phases: [] },
    {
      id: "ok-project",
      name: "Good",
      startDate: "2026-09-01",
      phases: [
        {
          id: "ph-good",
          name: "Good phase",
          amount: 3,
          unit: "days",
          color: "#12B886",
        },
        { id: "ph-bad-color", name: "Bad color", amount: 1, unit: "days", color: "#999999" },
      ],
    },
  ];

  const result = migrateProjects(mixedData);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "ok-project");
  // The corrupt phase was skipped, good phase preserved
  assert.equal(result[0].phases.length, 1);
  assert.equal(result[0].phases[0].id, "ph-good");
});
