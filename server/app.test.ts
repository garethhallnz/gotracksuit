import { Database } from "@db/sqlite";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { createApp } from "./app.ts";
import { withDB } from "./testing.ts";

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

describe("unexpected errors", () => {
  it("respond 500 with the standard error body and keep the security header", async () => {
    const db = new Database(":memory:");
    db.close();
    const app = createApp(db);

    const response = await app.handle(request("/insights"));

    expect(response?.status).toBe(500);
    expect(response?.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(await response?.json()).toEqual({ message: "Something went wrong" });
  });
});
