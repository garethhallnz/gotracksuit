import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HttpError } from "../../lib/request.ts";
import { AddInsight } from "./add-insight.tsx";

const submitInsight = (onAdd: () => Promise<void>) => {
  const onClose = vi.fn();
  render(<AddInsight open onClose={onClose} onAdd={onAdd} />);

  fireEvent.change(screen.getByRole("combobox", { name: "Brand" }), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Insight" }), {
    target: { value: "Socks with sandals" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add insight" }));

  return { onClose };
};

describe("AddInsight", () => {
  it("shows how many characters have been used out of the limit", () => {
    render(
      <AddInsight open onClose={() => {}} onAdd={() => Promise.resolve()} />,
    );
    const textbox = screen.getByRole("textbox", { name: "Insight" });
    expect(textbox).toHaveAccessibleDescription("0 / 1000");

    fireEvent.change(textbox, { target: { value: "Socks" } });
    expect(textbox).toHaveAccessibleDescription("5 / 1000");
  });

  it("closes once the insight is added", async () => {
    const { onClose } = submitInsight(() => Promise.resolve());

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("ignores further submits while the insight is being added", () => {
    const onAdd = vi.fn(() => new Promise<void>(() => {}));
    submitInsight(onAdd);

    const button = screen.getByRole("button", { name: "Adding…" });
    expect(button).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(button);
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("stays open with the text kept when saving fails", async () => {
    const { onClose } = submitInsight(() => Promise.reject(new HttpError(500)));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't save the insight. Please try again.",
    );
    expect(screen.getByRole("textbox", { name: "Insight" })).toHaveValue(
      "Socks with sandals",
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("asks the user to check the insight when the API rejects it", async () => {
    submitInsight(() => Promise.reject(new HttpError(400)));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Check the insight and try again.",
    );
  });
});
