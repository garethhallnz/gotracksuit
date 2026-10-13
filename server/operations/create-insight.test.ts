import { expect } from "@std/expect";
import { beforeAll, describe, it } from "@std/testing/bdd";
import type { Insight } from "$models/insight.ts";
import { withDB } from "../testing.ts";
import createInsight from "./create-insight.ts";

describe("creating an insight", () => {
  withDB((fixture) => {
    const text = "Don't wear socks with sandals";
    let result: Insight;

    beforeAll(() => {
      result = createInsight({ ...fixture, brand: 2, text });
    });

    it("stores the insight and returns it as stored", () => {
      expect(result).toEqual({
        id: 1,
        brand: 2,
        createdAt: expect.any(Date),
        text,
      });
      expect(fixture.insights.selectAll()).toEqual([
        { ...result, createdAt: result.createdAt.toISOString() },
      ]);
    });
  });
});
