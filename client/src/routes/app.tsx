import { useEffect, useState } from "react";
import { Button } from "../components/button/button.tsx";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import { HttpError, request } from "../lib/request.ts";
// @ts-types="../types/css-module.d.ts"
import styles from "./app.module.css";
import { Insight, type NewInsight } from "@suittracker/lib/schemas/insight";

type Status = "loading" | "ready" | "load-failed" | "delete-failed";

const ignoreNotFound = (error: unknown) => {
  if (error instanceof HttpError && error.status === 404) return;
  throw error;
};

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const loadInsights = () =>
    request(`/api/insights`)
      .then((res) => res.json())
      .then((data) => {
        setInsights(Insight.array().parse(data));
        setStatus("ready");
      })
      .catch(() => setStatus("load-failed"));

  const retryLoad = () => {
    setStatus("loading");
    loadInsights();
  };

  const addInsight = (insight: NewInsight) =>
    request(`/api/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(insight),
    }).then(() => loadInsights());

  const deleteInsight = (id: number) =>
    request(`/api/insights/${id}`, { method: "DELETE" })
      .catch(ignoreNotFound)
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
