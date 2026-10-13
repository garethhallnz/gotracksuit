import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./app.tsx";

const json = (body: unknown) => new Response(JSON.stringify(body));
const status = (code: number) => new Response(null, { status: code });

const stubFetch = (...responses: Response[]) => {
  const fetch = vi.fn();
  responses.forEach((response) => fetch.mockResolvedValueOnce(response));
  vi.stubGlobal("fetch", fetch);
  return fetch;
};

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an error instead of the empty state when loading fails, and can retry", async () => {
    const fetch = stubFetch(status(500), json([]));
    render(<App />);

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Couldn't load insights.",
    );
    expect(screen.queryByText("We have no insight!")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("We have no insight!")).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
