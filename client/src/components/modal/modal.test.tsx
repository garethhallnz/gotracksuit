import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./modal.tsx";

const ModalWithOpener = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} title="Title" onClose={() => setOpen(false)}>
        Content
      </Modal>
    </>
  );
};

describe("Modal", () => {
  it("should open and close", () => {
    render(
      <Modal open={false} title="Title" onClose={() => undefined}>
        Closed modal
      </Modal>,
    );
    expect(screen.queryByText("Closed modal")).not.toBeInTheDocument();

    render(
      <Modal open={true} title="Title" onClose={() => undefined}>
        <div>Open modal</div>
      </Modal>,
    );
    expect(screen.getByText("Open modal")).toBeInTheDocument();
  });

  it("closes from the close button", () => {
    const onClose = vi.fn();
    render(<Modal open title="Title" onClose={onClose}>Content</Modal>);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("takes focus as a labelled dialog, isolates the page, and hands focus back on Escape", async () => {
    const { container: page } = render(<ModalWithOpener />);
    const opener = screen.getByRole("button", { name: "Open" });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: "Title" });
    expect(dialog).toHaveFocus();
    expect(page).toHaveAttribute("inert");

    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(opener).toHaveFocus();
    expect(page).not.toHaveAttribute("inert");
  });
});
