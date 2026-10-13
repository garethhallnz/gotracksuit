import { useEffect, useState } from "react";
import { Button } from "../components/button/button.tsx";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import * as insightRequests from "../requests/insights.ts";
// @ts-types="../types/css-module.d.ts"
import styles from "./app.module.css";
import type { Insight, NewInsight } from "@suittracker/lib/schemas/insight";

type Status = "loading" | "ready" | "load-failed" | "delete-failed";

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const loadInsights = () =>
    insightRequests.fetchInsights()
      .then((data) => {
        setInsights(data);
        setStatus("ready");
      })
      .catch(() => setStatus("load-failed"));

  const retryLoad = () => {
    setStatus("loading");
    loadInsights();
  };

  const addInsight = (insight: NewInsight) =>
    insightRequests.createInsight(insight).then(() => loadInsights());

  const deleteInsight = (id: number) =>
    insightRequests.deleteInsight(id)
      .then(() => loadInsights())
      .catch(() => setStatus("delete-failed"));

  useEffect(() => {
    loadInsights();
  }, []);

  const isListVisible = status === "ready" || status === "delete-failed";

  return (
    <main className={styles.main}>
      <Header onAddInsight={addInsight} />
      {status === "loading" && (
        <p role="status" className={styles.loading}>Loading insights…</p>
      )}
      {status === "load-failed" && (
        <div className={styles["load-failed"]}>
          <p role="alert">Couldn't load insights.</p>
          <Button label="Try again" theme="secondary" onClick={retryLoad} />
        </div>
      )}
      {isListVisible && (
        <Insights
          className={styles.insights}
          insights={insights}
          error={status === "delete-failed"
            ? "Couldn't delete the insight. Please try again."
            : undefined}
          onDelete={deleteInsight}
        />
      )}
    </main>
  );
};
