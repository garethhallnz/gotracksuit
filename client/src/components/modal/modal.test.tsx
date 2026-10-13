import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./modal.tsx";

describe("Modal", () => {
  it("should open and close", () => {
    render(
      <Modal open={false} onClose={() => undefined}>
        Closed modal
      </Modal>,
    );
    expect(screen.queryByText("Closed modal")).toBeFalsy();

    render(
      <Modal open={true} onClose={() => undefined}>
        <div>Open modal</div>
      </Modal>,
    );
    expect(screen.getByText("Open modal")).toBeTruthy();
  });

  it("closes from the close button", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}>Content</Modal>);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
