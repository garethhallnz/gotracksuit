import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx.ts";
// @ts-types="../../types/css-module.d.ts"
import styles from "./modal.module.css";

export type ModalProps = {
  /** Whether modal is open */
  open: boolean;
  /** Callback when modal closes */
  onClose(): void;
  title: string;
  /** Content of the modal */
  children?: ReactNode;
};

const ANIMATIONS = {
  overlay: {
    closed: { opacity: 0 },
    open: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
      },
    },
  },
  modal: {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0 },
  },
};

/**
 * @component
 * Modal that opens in a portal
 */
export const Modal = ({ open, onClose, title, children }: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement;
    const page = document.getElementById("root");
    page?.setAttribute("inert", "");
    dialogRef.current?.focus();

    return () => {
      page?.removeAttribute("inert");
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open]);

  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <LayoutGroup>
          <motion.div
            className={styles.overlay}
            variants={ANIMATIONS.overlay}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
            data-testid="overlay"
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className={cx(styles.modal)}
              variants={ANIMATIONS.modal}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onKeyDown={closeOnEscape}
            >
              <button
                type="button"
                className={styles.close}
                aria-label="Close"
                onClick={onClose}
              >
                <XIcon aria-hidden />
              </button>

              <div className={cx(styles.content)}>
                <h1 id={titleId} className={styles.title}>{title}</h1>
                {children}
              </div>
            </motion.div>
          </motion.div>
        </LayoutGroup>
      )}
    </AnimatePresence>,
    document.body,
  );
};
