import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { cx } from "../../lib/cx.ts";
import { Button } from "../button/button.tsx";
import styles from "./inline-confirm.module.css";

type InlineConfirmProps = {
  label: string;
  prompt: string;
  confirmLabel: string;
  onConfirm(): void;
  children: ReactNode;
};

const ANIMATION = {
  hidden: { width: 0, opacity: 0 },
  visible: { width: "auto", opacity: 1 },
};

const TRANSITION = { duration: 0.2, ease: "easeOut" };

export const InlineConfirm = ({
  label,
  prompt,
  confirmLabel,
  onConfirm,
  children,
}: InlineConfirmProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const promptId = useId();
  const transition = useReducedMotion() ? { duration: 0 } : TRANSITION;

  const startConfirming = () => {
    flushSync(() => setIsConfirming(true));
    cancelRef.current?.focus();
  };

  const cancel = () => {
    flushSync(() => setIsConfirming(false));
    triggerRef.current?.focus();
  };

  const confirm = () => {
    setIsConfirming(false);
    onConfirm();
  };

  const cancelOnEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    cancel();
  };

  return (
    <div className={styles.root}>
      <AnimatePresence initial={false}>
        {isConfirming
          ? (
            <motion.div
              key="confirm"
              role="group"
              aria-labelledby={promptId}
              className={cx(styles.clip, styles.confirm)}
              onKeyDown={cancelOnEscape}
              variants={ANIMATION}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={transition}
            >
              <span id={promptId} className={styles.prompt}>{prompt}</span>
              <Button
                ref={cancelRef}
                type="button"
                theme="secondary"
                label="Cancel"
                className={styles.action}
                onClick={cancel}
              />
              <Button
                type="button"
                theme="danger"
                label={confirmLabel}
                className={styles.action}
                onClick={confirm}
              />
            </motion.div>
          )
          : (
            <motion.div
              key="trigger"
              className={styles.clip}
              variants={ANIMATION}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={transition}
            >
              <button
                ref={triggerRef}
                type="button"
                className={styles.trigger}
                aria-label={label}
                onClick={startConfirming}
              >
                {children}
              </button>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
