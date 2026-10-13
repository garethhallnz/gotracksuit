import { type FormEvent, useState } from "react";
import { BRANDS } from "../../lib/consts.ts";
import type { NewInsight } from "../../schemas/insight.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps & {
  onAdd(insight: NewInsight): Promise<void>;
};

export const AddInsight = ({ onAdd, ...props }: AddInsightProps) => {
  const [brand, setBrand] = useState(BRANDS[0].id);
  const [text, setText] = useState("");

  const addInsight = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAdd({ brand, text }).then(() => {
      setText("");
      props.onClose();
    });
  };

  return (
    <Modal {...props}>
      <h1 className={styles.heading}>Add a new insight</h1>
      <form className={styles.form} onSubmit={addInsight}>
        <label className={styles.field}>
          <select
            className={styles["field-input"]}
            value={brand}
            onChange={(e) => setBrand(Number(e.target.value))}
          >
            {BRANDS.map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Insight
          <textarea
            className={styles["field-input"]}
            rows={5}
            placeholder="Something insightful..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <Button className={styles.submit} type="submit" label="Add insight" />
      </form>
    </Modal>
  );
};
