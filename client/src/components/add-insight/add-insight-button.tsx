// @ts-types="@types/react"
import { useState } from "react";
import type { NewInsight } from "@suittracker/lib/schemas/insight";
import { Button } from "../button/button.tsx";
import { AddInsight } from "./add-insight.tsx";

type AddInsightButtonProps = {
  onAdd(insight: NewInsight): Promise<void>;
};

export const AddInsightButton = ({ onAdd }: AddInsightButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        label="Add insight"
        theme="secondary"
        onClick={() => setIsOpen(true)}
      />
      <AddInsight
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onAdd={onAdd}
      />
    </>
  );
};
