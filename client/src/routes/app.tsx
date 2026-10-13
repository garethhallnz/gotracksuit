import { Button } from "../components/button/button.tsx";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import { useInsights } from "../hooks/use-insights.ts";
// @ts-types="../types/css-module.d.ts"
import styles from "./app.module.css";

export const App = () => {
  const { insights, status, retryLoad, addInsight, deleteInsight } =
    useInsights();

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
