import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./app.tsx";

const INSIGHT = {
  id: 1,
  brand: 1,
  createdAt: "2026-10-13T05:30:00.000Z",
  text: "Socks with sandals",
};

const json = (body: unknown) => new Response(JSON.stringify(body));
const status = (code: number) => new Response(null, { status: code });

const stubFetch = (...responses: Response[]) => {
  const fetch = vi.fn();
  responses.forEach((response) => fetch.mockResolvedValueOnce(response));
  vi.stubGlobal("fetch", fetch);
  return fetch;
};

const confirmDelete = async () => {
  fireEvent.click(
    await screen.findByRole("button", { name: "Delete insight" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
};

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a loading message until insights arrive", async () => {
    const { promise, resolve } = Promise.withResolvers<Response>();
    vi.stubGlobal("fetch", vi.fn(() => promise));
    render(<App />);

    expect(screen.getByRole("status").textContent).toBe("Loading insights…");
    expect(screen.queryByText("We have no insight!")).toBeNull();

    resolve(json([]));

    expect(await screen.findByText("We have no insight!")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
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

  it("adds an insight and shows it in the list", async () => {
    const fetch = stubFetch(json([]), status(201), json([INSIGHT]));
    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: "Add insight" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Insight" }), {
      target: { value: INSIGHT.text },
    });
    const [, submit] = screen.getAllByRole("button", { name: "Add insight" });
    fireEvent.click(submit);

    expect(await screen.findByText(INSIGHT.text, { selector: "p" }))
      .toBeTruthy();
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/insights",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ brand: INSIGHT.brand, text: INSIGHT.text }),
      }),
    );
  });

  it("treats deleting an insight that's already gone as done", async () => {
    stubFetch(json([INSIGHT]), status(404), json([]));
    render(<App />);

    await confirmDelete();

    expect(await screen.findByText("We have no insight!")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("keeps the insight and shows an error when deleting fails", async () => {
    stubFetch(json([INSIGHT]), status(500));
    render(<App />);

    await confirmDelete();

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Couldn't delete the insight. Please try again.",
    );
    expect(screen.getByText(INSIGHT.text)).toBeTruthy();
  });
});
