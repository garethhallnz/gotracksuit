import { useEffect, useState } from "react";
import type { Insight, NewInsight } from "@suittracker/lib/schemas/insight";
import * as insightRequests from "../requests/insights.ts";

type Status = "loading" | "ready" | "load-failed" | "delete-failed";

export const useInsights = () => {
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

  return { insights, status, retryLoad, addInsight, deleteInsight };
};
