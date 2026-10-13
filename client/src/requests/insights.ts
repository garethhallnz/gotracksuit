import { Insight, type NewInsight } from "@suittracker/lib/schemas/insight";
import { HttpError, request } from "../lib/request.ts";

const ignoreNotFound = (error: unknown) => {
  if (error instanceof HttpError && error.status === 404) return;
  throw error;
};

export const fetchInsights = () =>
  request(`/api/insights`)
    .then((res) => res.json())
    .then((data) => Insight.array().parse(data));

export const createInsight = (insight: NewInsight) =>
  request(`/api/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(insight),
  }).then(() => undefined);

export const deleteInsight = (id: number) =>
  request(`/api/insights/${id}`, { method: "DELETE" })
    .then(() => undefined)
    .catch(ignoreNotFound);
