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

const renderInPageRoot = () => {
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
  render(<ModalWithOpener />, { container: root });
  return root;
};

describe("Modal", () => {
  it("should open and close", () => {
    render(
      <Modal open={false} title="Title" onClose={() => undefined}>
        Closed modal
      </Modal>,
    );
    expect(screen.queryByText("Closed modal")).toBeFalsy();

    render(
      <Modal open={true} title="Title" onClose={() => undefined}>
        <div>Open modal</div>
      </Modal>,
    );
    expect(screen.getByText("Open modal")).toBeTruthy();
  });

  it("closes from the close button", () => {
    const onClose = vi.fn();
    render(<Modal open title="Title" onClose={onClose}>Content</Modal>);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("takes focus as a labelled dialog, isolates the page, and hands focus back on Escape", async () => {
    const root = renderInPageRoot();
    const opener = screen.getByRole("button", { name: "Open" });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: "Title" });
    expect(document.activeElement).toBe(dialog);
    expect(root.hasAttribute("inert")).toBe(true);

    fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(opener);
    expect(root.hasAttribute("inert")).toBe(false);
  });
});
