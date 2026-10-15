import { AddInsightButton } from "../components/add-insight/add-insight-button.tsx";
import { Button } from "../components/button/button.tsx";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import { useInsights } from "../hooks/use-insights.ts";
// @ts-types="../types/css-module.d.ts"
import styles from "./app.module.css";

export const App = () => {
  const {
    insights,
    status,
    hasDeleteFailed,
    retryLoad,
    addInsight,
    deleteInsight,
  } = useInsights();

  return (
    <main className={styles.main}>
      <Header actions={<AddInsightButton onAdd={addInsight} />} />
      {status === "loading" && (
        <p role="status" className={styles.loading}>Loading insights…</p>
      )}
      {status === "load-failed" && (
        <div className={styles["load-failed"]}>
          <p role="alert">Couldn't load insights.</p>
          <Button label="Try again" theme="secondary" onClick={retryLoad} />
        </div>
      )}
      {status === "ready" && (
        <Insights
          className={styles.insights}
          insights={insights}
          error={hasDeleteFailed
            ? "Couldn't delete the insight. Please try again."
            : undefined}
          onDelete={deleteInsight}
        />
      )}
    </main>
  );
};
