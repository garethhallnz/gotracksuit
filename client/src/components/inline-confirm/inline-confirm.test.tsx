import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InlineConfirm } from "./inline-confirm.tsx";

const renderInlineConfirm = () => {
  const onConfirm = vi.fn();
  render(
    <InlineConfirm
      label="Delete thing"
      prompt="Delete this thing?"
      confirmLabel="Delete"
      onConfirm={onConfirm}
    >
      x
    </InlineConfirm>,
  );
  return { onConfirm };
};

const startConfirming = () =>
  fireEvent.click(screen.getByRole("button", { name: "Delete thing" }));

describe("InlineConfirm", () => {
  it("asks for confirmation and focuses cancel when the trigger is clicked", () => {
    renderInlineConfirm();
    startConfirming();

    expect(screen.getByRole("group", { name: "Delete this thing?" }))
      .toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Cancel" }),
    );
  });

  it("calls onConfirm when confirmed", () => {
    const { onConfirm } = renderInlineConfirm();
    startConfirming();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("returns focus to the trigger without confirming when cancelled", () => {
    const { onConfirm } = renderInlineConfirm();
    startConfirming();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Delete thing" }),
    );
  });

  it("returns focus to the trigger without confirming on Escape", () => {
    const { onConfirm } = renderInlineConfirm();
    startConfirming();
    fireEvent.keyDown(screen.getByRole("group"), { key: "Escape" });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Delete thing" }),
    );
  });
});
