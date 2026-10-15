import { Trash2Icon } from "lucide-react";
import { useRef } from "react";
import { BRANDS } from "../../lib/consts.ts";
import { InlineConfirm } from "../inline-confirm/inline-confirm.tsx";
// @ts-types="../../types/css-module.d.ts"
import styles from "./insights.module.css";
import type { Insight } from "@suittracker/lib/schemas/insight";

type InsightsProps = {
  insights: Insight[];
  className?: string;
  error?: string;
  onDelete(id: number): void;
};

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const lookupBrandName = (brand: number) =>
  BRANDS.find(({ id }) => id === brand)?.name ?? `Unknown brand (${brand})`;

export const Insights = (
  { insights, className, error, onDelete }: InsightsProps,
) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  const deleteInsight = (id: number) => {
    onDelete(id);
    headingRef.current?.focus();
  };

  return (
    <div className={className}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
        Insights
      </h1>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.list}>
        {insights?.length
          ? (
            insights.map(({ id, text, createdAt, brand }) => (
              <div className={styles.insight} key={id}>
                <div className={styles["insight-meta"]}>
                  <span>{lookupBrandName(brand)}</span>
                  <div className={styles["insight-meta-details"]}>
                    <time dateTime={createdAt.toISOString()}>
                      {DATE_FORMAT.format(createdAt)}
                    </time>
                    <InlineConfirm
                      label="Delete insight"
                      prompt="Delete this insight?"
                      confirmLabel="Delete"
                      onConfirm={() =>
                        deleteInsight(id)}
                    >
                      <Trash2Icon
                        className={styles["insight-delete"]}
                        aria-hidden
                      />
                    </InlineConfirm>
                  </div>
                </div>
                <p className={styles["insight-content"]}>{text}</p>
              </div>
            ))
          )
          : <p>We have no insight!</p>}
      </div>
    </div>
  );
};
