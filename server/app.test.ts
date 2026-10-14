import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { createApp } from "./app.ts";
import { withDB } from "./testing.ts";

const createdAt = "2026-10-13T05:30:00.000Z";

const request = (path: string, init?: RequestInit) =>
  new Request(`http://localhost${path}`, init);

describe("security headers", () => {
  withDB((fixture) => {
    it("tells browsers not to sniff the content type, on success and error responses", async () => {
      const app = createApp(fixture.db);

      for (const path of ["/insights", "/insights/999999", "/unknown"]) {
        const response = await app.handle(request(path));
        expect(response?.headers.get("X-Content-Type-Options")).toBe(
          "nosniff",
        );
      }
    });
  });
});

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
      expect((await app.handle(request("/insights/2")))?.status).toBe(404);
      expect((await app.handle(request("/insights/abc")))?.status).toBe(400);
    });
  });
});

describe("POST /insights", () => {
  withDB((fixture) => {
    it("creates an insight with trimmed text, and rejects blank text and non-JSON bodies", async () => {
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

      expect((await post({ brand: 2, text: "   " }))?.status).toBe(400);

      const formPost = await app.handle(request("/insights", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ brand: 2, text: "From another site" }),
      }));
      expect(formPost?.status).toBe(415);
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

describe("DELETE /insights/:id", () => {
  withDB((fixture) => {
    it("deletes an insight, then returns 404, and rejects an invalid id", async () => {
      fixture.insights.insert([{ brand: 1, createdAt, text: "Socks" }]);
      const app = createApp(fixture.db);
      const remove = (id: string) =>
        app.handle(request(`/insights/${id}`, { method: "DELETE" }));

      expect((await remove("1"))?.status).toBe(204);
      expect((await remove("1"))?.status).toBe(404);
      expect((await remove("abc"))?.status).toBe(400);
    });
  });
});
