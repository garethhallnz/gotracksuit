import { useEffect, useState } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import styles from "./app.module.css";
import { Insight, type NewInsight } from "../schemas/insight.ts";

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);

  const loadInsights = () =>
    fetch(`/api/insights`)
      .then((res) => res.json())
      .then((data) => setInsights(Insight.array().parse(data)));

  const addInsight = (insight: NewInsight) =>
    fetch(`/api/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(insight),
    }).then(() => loadInsights());

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <main className={styles.main}>
      <Header onAddInsight={addInsight} />
      <Insights className={styles.insights} insights={insights} />
    </main>
  );
};
