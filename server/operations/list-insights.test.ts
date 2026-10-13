import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import type { Insight } from "@suittracker/lib/schemas/insight";
import { withDB } from "../testing.ts";
import listInsights from "./list-insights.ts";

describe("listing insights in the database", () => {
  describe("nothing in the DB", () => {
    withDB((fixture) => {
      let result: Insight[];

      beforeAll(() => {
        result = listInsights(fixture);
      });

      it("returns empty result", () => {
        expect(result).toEqual([]);
      });
    });
  });

  describe("populated DB", () => {
    withDB((fixture) => {
      const insights: Insight[] = [
        { id: 1, brand: 0, createdAt: new Date("2026-01-02"), text: "1" },
        { id: 2, brand: 0, createdAt: new Date("2026-01-04"), text: "Don't" },
        { id: 3, brand: 1, createdAt: new Date("2026-01-01"), text: "3" },
        { id: 4, brand: 4, createdAt: new Date("2026-01-03"), text: "4" },
      ];

      let result: Insight[];

      beforeAll(() => {
        fixture.insights.insert(
          insights.map((it) => ({
            ...it,
            createdAt: it.createdAt.toISOString(),
          })),
        );
        result = listInsights(fixture);
      });

      it("returns non-empty result", () => {
        expect(result.length).toBeGreaterThan(0);
      });

      it("returns all insights in the DB, newest first", () => {
        expect(result).toEqual([
          insights[1],
          insights[3],
          insights[0],
          insights[2],
        ]);
      });
    });
  });
});
