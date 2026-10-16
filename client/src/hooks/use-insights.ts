// @ts-types="@types/react"
import { useEffect, useState } from "react";
import type { Insight, NewInsight } from "@suittracker/lib/schemas/insight";
import * as insightRequests from "../requests/insights.ts";

type Status = "loading" | "ready" | "load-failed";

export const useInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [hasDeleteFailed, setHasDeleteFailed] = useState(false);

  const loadInsights = () =>
    insightRequests.fetchInsights()
      .then((data) => {
        setInsights(data);
        setStatus("ready");
        setHasDeleteFailed(false);
      })
      .catch(() => setStatus("load-failed"));

  const retryLoad = () => {
    setStatus("loading");
    loadInsights();
  };

  const addInsight = (insight: NewInsight) =>
    insightRequests.createInsight(insight).then(() => loadInsights());

  const deleteInsight = (id: number) => {
    setHasDeleteFailed(false);
    return insightRequests.deleteInsight(id)
      .then(() => loadInsights())
      .catch(() => setHasDeleteFailed(true));
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return {
    insights,
    status,
    hasDeleteFailed,
    retryLoad,
    addInsight,
    deleteInsight,
  };
};
