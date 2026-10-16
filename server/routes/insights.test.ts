import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { createApp } from "../app.ts";
import { withDB } from "../testing.ts";

const createdAt = "2026-10-13T05:30:00.000Z";

const request = (path: string, init?: RequestInit) =>
  new Request(`http://localhost${path}`, init);

const expectError = async (
  response: Response | undefined,
  status: number,
  body: Record<string, unknown>,
) => {
  expect(response?.status).toBe(status);
  expect(await response?.json()).toEqual(body);
};

const INVALID_ID = {
  message: "Insight id must be a non-negative whole number",
};
const NOT_FOUND = { message: "Insight not found" };

describe("GET /insights/:id", () => {
  withDB((fixture) => {
    it("returns the insight, 404 for a missing id and 400 for an invalid one", async () => {
      fixture.insights.insert([{ brand: 1, createdAt, text: "Socks" }]);
      const app = createApp(fixture.db);

      const found = await app.handle(request("/insights/1"));
      expect(found?.status).toBe(200);
      expect(await found?.json()).toEqual({
        id: 1,
        brand: 1,
        createdAt,
        text: "Socks",
      });
      await expectError(
        await app.handle(request("/insights/2")),
        404,
        NOT_FOUND,
      );
      await expectError(
        await app.handle(request("/insights/abc")),
        400,
        INVALID_ID,
      );
    });
  });
});

describe("POST /insights", () => {
  withDB((fixture) => {
    it("creates an insight with trimmed text, and rejects blank text, non-JSON and malformed JSON bodies", async () => {
      const app = createApp(fixture.db);
      const post = (body: unknown) =>
        app.handle(request("/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }));

      const created = await post({ brand: 2, text: "  Don't do it  " });
      expect(created?.status).toBe(201);
      expect(await created?.json()).toMatchObject({
        id: 1,
        brand: 2,
        text: "Don't do it",
      });

      await expectError(await post({ brand: 2, text: "   " }), 400, {
        message: "Request body is invalid",
        fieldErrors: { text: ["String must contain at least 1 character(s)"] },
      });

      const formPost = await app.handle(request("/insights", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ brand: 2, text: "From another site" }),
      }));
      await expectError(formPost, 415, {
        message: "Request body must be JSON",
      });

      const malformed = await app.handle(request("/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"brand": 2,',
      }));
      expect(malformed?.headers.get("X-Content-Type-Options")).toBe("nosniff");
      await expectError(malformed, 400, {
        message: "Request body must be valid JSON",
      });
      expect(fixture.insights.selectAll()).toHaveLength(1);
    });
  });
});

describe("POST /insights text length", () => {
  withDB((fixture) => {
    it("accepts text up to 1,000 characters and rejects longer text", async () => {
      const app = createApp(fixture.db);
      const post = (text: string) =>
        app.handle(request("/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand: 1, text }),
        }));

      expect((await post("x".repeat(1000)))?.status).toBe(201);
      expect((await post("x".repeat(1001)))?.status).toBe(400);
      expect(fixture.insights.selectAll()).toHaveLength(1);
    });
  });
});

describe("POST /insights brand range", () => {
  withDB((fixture) => {
    it("accepts the largest brand id the database reads back intact and rejects larger ones", async () => {
      const app = createApp(fixture.db);
      const post = (brand: number) =>
        app.handle(request("/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand, text: "Socks" }),
        }));

      const largest = await post(2 ** 31 - 1);
      expect(largest?.status).toBe(201);
      expect(await largest?.json()).toMatchObject({ brand: 2 ** 31 - 1 });
      expect((await post(2 ** 31))?.status).toBe(400);
      expect(fixture.insights.selectAll()).toHaveLength(1);
    });
  });
});

describe("DELETE /insights/:id", () => {
  withDB((fixture) => {
    it("deletes an insight, then returns 404, and rejects an invalid id", async () => {
      fixture.insights.insert([{ brand: 1, createdAt, text: "Socks" }]);
      const app = createApp(fixture.db);
      const remove = (id: string) =>
        app.handle(request(`/insights/${id}`, { method: "DELETE" }));

      expect((await remove("1"))?.status).toBe(204);
      await expectError(await remove("1"), 404, NOT_FOUND);
      await expectError(await remove("abc"), 400, INVALID_ID);
    });
  });
});

describe("DELETE /insights/:id repeated after a newer insight is added", () => {
  withDB((fixture) => {
    it("leaves the newer insight alone", async () => {
      const app = createApp(fixture.db);
      const post = (text: string) =>
        app.handle(request("/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brand: 1, text }),
        }));
      const removeFirst = () =>
        app.handle(request("/insights/1", { method: "DELETE" }));

      await post("Old");
      await removeFirst();
      await post("New");

      await expectError(await removeFirst(), 404, NOT_FOUND);
      expect(fixture.insights.selectAll().map(({ text }) => text)).toEqual([
        "New",
      ]);
    });
  });
});
