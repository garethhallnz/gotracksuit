import type { ReactNode } from "react";
// @ts-types="../../types/css-module.d.ts"
import styles from "./header.module.css";

export const HEADER_TEXT = "Suit Tracker Insights";

type HeaderProps = {
  actions?: ReactNode;
};

export const Header = ({ actions }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.logo}>{HEADER_TEXT}</span>
        {actions}
      </div>
    </header>
  );
};
