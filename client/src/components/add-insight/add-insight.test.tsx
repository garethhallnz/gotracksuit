import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HttpError } from "../../lib/request.ts";
import { AddInsight } from "./add-insight.tsx";

const submitInsight = (onAdd: () => Promise<void>) => {
  const onClose = vi.fn();
  render(<AddInsight open onClose={onClose} onAdd={onAdd} />);

  fireEvent.change(screen.getByRole("textbox", { name: "Insight" }), {
    target: { value: "Socks with sandals" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add insight" }));

  return { onClose };
};

describe("AddInsight", () => {
  it("closes once the insight is added", async () => {
    const { onClose } = submitInsight(() => Promise.resolve());

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("stays open with the text kept when saving fails", async () => {
    const { onClose } = submitInsight(() => Promise.reject(new HttpError(500)));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Couldn't save the insight. Please try again.",
    );
    expect(screen.getByRole("textbox", { name: "Insight" })).toHaveProperty(
      "value",
      "Socks with sandals",
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("asks the user to check the insight when the API rejects it", async () => {
    submitInsight(() => Promise.reject(new HttpError(400)));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Check the insight and try again.",
    );
  });
});
