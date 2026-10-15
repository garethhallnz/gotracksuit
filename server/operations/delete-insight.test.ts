import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { withDB } from "../testing.ts";
import { deleteInsight } from "./delete-insight.ts";

describe("deleting an insight", () => {
  withDB((fixture) => {
    let isFirstDeleted: boolean;
    let isRepeatDeleted: boolean;

    beforeAll(() => {
      const createdAt = new Date().toISOString();
      fixture.insights.insert([
        { brand: 0, createdAt, text: "1" },
        { brand: 0, createdAt, text: "2" },
      ]);
      isFirstDeleted = deleteInsight(fixture.db, 1);
      isRepeatDeleted = deleteInsight(fixture.db, 1);
    });

    it("removes only that insight and reports whether one was deleted", () => {
      expect(isFirstDeleted).toBe(true);
      expect(isRepeatDeleted).toBe(false);
      expect(fixture.insights.selectAll().map(({ id }) => id)).toEqual([2]);
    });
  });
});
