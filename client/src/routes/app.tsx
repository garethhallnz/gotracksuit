import { useEffect, useState } from "react";
import { Button } from "../components/button/button.tsx";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import { HttpError, request } from "../lib/request.ts";
import styles from "./app.module.css";
import { Insight, type NewInsight } from "../schemas/insight.ts";

type Failure = "load" | "delete";

const ignoreNotFound = (error: unknown) => {
  if (error instanceof HttpError && error.status === 404) return;
  throw error;
};

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [failure, setFailure] = useState<Failure | null>(null);

  const loadInsights = () =>
    request(`/api/insights`)
      .then((res) => res.json())
      .then((data) => {
        setInsights(Insight.array().parse(data));
        setFailure(null);
      })
      .catch(() => setFailure("load"));

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
      .catch(() => setFailure("delete"));

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <main className={styles.main}>
      <Header onAddInsight={addInsight} />
      {failure === "load"
        ? (
          <div className={styles["load-failed"]}>
            <p role="alert">Couldn't load insights.</p>
            <Button
              label="Try again"
              theme="secondary"
              onClick={() => loadInsights()}
            />
          </div>
        )
        : (
          <Insights
            className={styles.insights}
            insights={insights}
            error={failure === "delete"
              ? "Couldn't delete the insight. Please try again."
              : undefined}
            onDelete={deleteInsight}
          />
        )}
    </main>
  );
};
