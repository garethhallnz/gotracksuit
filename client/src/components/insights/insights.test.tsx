import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Insights } from "./insights.tsx";

const TEST_INSIGHTS = [
  {
    id: 1,
    brand: 1,
    createdAt: new Date(),
    text: "Test insight",
  },
  { id: 2, brand: 2, createdAt: new Date(), text: "Another test insight" },
];

describe("insights", () => {
  it("renders", () => {
    const { getByText } = render(
      <Insights insights={TEST_INSIGHTS} onDelete={() => undefined} />,
    );
    expect(getByText(TEST_INSIGHTS[0].text)).toBeTruthy();
  });

  it("deletes an insight only once the delete is confirmed", () => {
    const onDelete = vi.fn();
    render(<Insights insights={TEST_INSIGHTS} onDelete={onDelete} />);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Delete insight" })[0],
    );
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(TEST_INSIGHTS[0].id);
  });
});
