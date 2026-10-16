import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpError, request } from "./request.ts";

const stubFetchStatus = (status: number) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(new Response(null, { status }))),
  );

describe("request", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves with the response when it succeeds", async () => {
    stubFetchStatus(204);
    const res = await request("/thing");
    expect(res.status).toBe(204);
  });

  it("rejects with a client HttpError for a 4xx response", async () => {
    stubFetchStatus(404);
    const error = await request("/thing").catch((e) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(404);
    expect(error.isClientError).toBe(true);
  });

  it("rejects with a non-client HttpError for a 5xx response", async () => {
    stubFetchStatus(500);
    const error = await request("/thing").catch((e) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.isClientError).toBe(false);
  });

  it("gives up on a request that gets no response within 10 seconds", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: string, init?: RequestInit) =>
        new Promise((_resolve, reject) =>
          init?.signal?.addEventListener(
            "abort",
            () => reject(init.signal?.reason),
          )
        )
      ),
    );

    const result = request("/thing").catch((error) => error);
    await vi.advanceTimersByTimeAsync(10_000);

    expect(await result).toHaveProperty("name", "TimeoutError");
    vi.useRealTimers();
  });
});
