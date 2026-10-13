import { useEffect, useState } from "react";
import { Button } from "../components/button/button.tsx";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import { request } from "../lib/request.ts";
import styles from "./app.module.css";
import { Insight, type NewInsight } from "../schemas/insight.ts";

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  const loadInsights = () =>
    request(`/api/insights`)
      .then((res) => res.json())
      .then((data) => {
        setInsights(Insight.array().parse(data));
        setHasLoadFailed(false);
      })
      .catch(() => setHasLoadFailed(true));

  const addInsight = (insight: NewInsight) =>
    fetch(`/api/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(insight),
    }).then(() => loadInsights());

  const deleteInsight = (id: number) =>
    fetch(`/api/insights/${id}`, { method: "DELETE" })
      .then(() => loadInsights());

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <main className={styles.main}>
      <Header onAddInsight={addInsight} />
      {hasLoadFailed
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
            onDelete={deleteInsight}
          />
        )}
    </main>
  );
};
