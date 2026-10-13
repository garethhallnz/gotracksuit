import { type FormEvent, useState } from "react";
import { BRANDS } from "../../lib/consts.ts";
import { HttpError } from "../../lib/request.ts";
import type { NewInsight } from "../../schemas/insight.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = Pick<ModalProps, "open" | "onClose"> & {
  onAdd(insight: NewInsight): Promise<void>;
};

const describeAddFailure = (error: unknown) =>
  error instanceof HttpError && error.isClientError
    ? "Check the insight and try again."
    : "Couldn't save the insight. Please try again.";

export const AddInsight = ({ onAdd, ...props }: AddInsightProps) => {
  const [brand, setBrand] = useState(BRANDS[0].id);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => {
    setError(null);
    props.onClose();
  };

  const addInsight = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    onAdd({ brand, text })
      .then(() => {
        setText("");
        close();
      })
      .catch((error) => setError(describeAddFailure(error)))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Modal {...props} title="Add a new insight" onClose={close}>
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
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <Button
          className={styles.submit}
          type="submit"
          label={isSubmitting ? "Adding…" : "Add insight"}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
};
